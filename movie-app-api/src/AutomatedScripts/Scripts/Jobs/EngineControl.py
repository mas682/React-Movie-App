# 8/31/2021
# Matt Stropkey
# This script is used to run the jobs in the queue.  It will first check to see how many 
# job containers are running.  If not at the maximum number of containers to run, see if 
# there is work to do and start a eninge container
# command to run(will have to change jobId and stepId):
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.EngineControl -jobId 1 -stepId 3

import docker

def main(logger, db, extras, jobId, jobDetailsId):
    # fix how loc file is working.....
    # should not lock on failed job...
    dockerCli = docker.from_env()
    print(dockerCli.containers.list())
    # control how many containers should be running from database
    # check which containers are running
    # function to do that

    # check if there are any jobs in the queue

    # if jobs, start containers for
    print("Test")

    return "Finished Successfully"