const cron = require('node-cron');
const config = require('../../config');
const logger = require('../../utils/logger');
const messages = require('../../constants/messages');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Converts minutes to cron expression
   * @param {number} minutes - Interval in minutes
   * @returns {string} Cron expression
   */
  getCronExpression(minutes) {
    if (minutes < 1) minutes = 1;
    return `*/${minutes} * * * *`; // Run every X minutes
  }

  /**
   * Starts the scheduler
   * @param {Function} task - The task to execute
   * @param {string} [jobName='default'] - Name of the job
   */
  start(task, jobName = 'default') {
    if (!config.app.cron.enabled) {
      logger.info('Cron jobs are disabled in configuration');
      return;
    }

    if (this.jobs.has(jobName)) {
      logger.warn(`Job ${jobName} is already running`);
      return;
    }

    const cronExpression = this.getCronExpression(config.app.cron.interval);
    
    logger.info(`Starting cron job '${jobName}' with schedule: ${cronExpression}`);
    
    const job = cron.schedule(cronExpression, async () => {
      try {
        logger.info(`Executing scheduled task: ${jobName}`);
        await task();
      } catch (error) {
        logger.error(`Error in scheduled task ${jobName}:`, error);
      }
    }, {
      scheduled: true,
      timezone: config.app.cron.timezone
    });

    this.jobs.set(jobName, job);
    this.isRunning = true;
    
    // Execute task immediately on start
    task().catch(error => {
      logger.error(`Error in initial task execution ${jobName}:`, error);
    });
  }

  /**
   * Stops a specific job or all jobs
   * @param {string} [jobName] - Name of the job to stop. If not provided, stops all jobs
   */
  stop(jobName) {
    if (jobName) {
      const job = this.jobs.get(jobName);
      if (job) {
        job.stop();
        this.jobs.delete(jobName);
        logger.info(`Stopped cron job: ${jobName}`);
      }
    } else {
      // Stop all jobs
      for (const [name, job] of this.jobs) {
        job.stop();
        logger.info(`Stopped cron job: ${name}`);
      }
      this.jobs.clear();
    }
    
    this.isRunning = this.jobs.size > 0;
  }

  /**
   * Gets the status of all jobs
   * @returns {Object} Status of all jobs
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: {}
    };

    for (const [name, job] of this.jobs) {
      status.jobs[name] = {
        running: job.getStatus() === 'scheduled',
        lastRun: job.lastDate,
        nextRun: job.nextDate
      };
    }

    return status;
  }
}

module.exports = new SchedulerService(); 