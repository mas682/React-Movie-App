# 9/19/2021
# Matt Stropkey
# This script is used set the environment variables in the crontab file
# You MUST have the ENVIRONMENT variable set before running this
# example command to run:
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.ManualScriptController -path AutomatedScripts.Scripts.Jobs.CronEnvironmentSetter


from crontab import CronTab
from AutomatedScripts.shared.config import config
import os

def main(logger, db, extras, jobId, jobDetailsId, arguments):
    environment = os.getenv('ENVIRONMENT')
    if(environment is None):
        raise Exception("Could not determine what environment the script is running on")
    conf = config(environment, 'cron')
    # put the user in a config file
    cron = CronTab(user=conf['user'])
    print(conf)
    for key in conf:
        cron.env[key.upper()] = conf[key]

    cron.write()
    return "Finished Successfully"