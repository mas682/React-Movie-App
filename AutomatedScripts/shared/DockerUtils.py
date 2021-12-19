# 10/7/2021
# Matt Stropkey
# Various functions to manage docker containers via python

import docker
import os
from dotenv import dotenv_values


# engine should only not be None for jobs being ran from scheduled queue
# for cron jobs, leave set to None
# job should be an array of various fields for a single job (see EngineControl.py or CronJobContainerStarter.py)
# jobDetailsId is only used when starting a container for a cron job
# these jobs should have a job details Id already set for them prior to this running
def startDockerContainer(dockerCli, job, engine, environment, jobDetailsId):
    if(engine is not None):
        print("Starting the container for engine " + str(engine))
    # get path to source for bind mount
    source = os.path.realpath(__file__)
    source = source.partition("AutomatedScripts")[0]
    sourcePath = source + "AutomatedScripts"
    mount = docker.types.Mount(source=sourcePath,target="/home/AutomatedScripts", type="bind")
    # get path to environment variables file
    configPath = ""
    if(environment == "LOCAL-DEV" or environment == "DEV"):
        configPath = "/Docker/dev.env"
    elif(environment == "PROD"):
        configPath = "/Docker/prod.env"
    # read the environment variables into a dict
    config = dict(dotenv_values(sourcePath + configPath))
    if(engine is not None):
        config["ENGINE"] = str(engine)

    jobId = str(job[0][1])
    stepId = str(job[0][2])
    timeout = job[0][4] if job[0][4] is not None else 0
    arguments = job[0][5] if job[0][5] is not None else ""
    scriptPath = job[0][6]
    imageName = job[0][7]
    containerName = job[0][8] if job[0][8] is not None else ""
    memoryLimit = job[0][9] if job[0][9] is not None else ""
    cpusToRunOn = job[0][10] if job[0][10] is not None else ""
    cpuShares = job[0][11] if job[0][11] is not None else 0
    cpuPeriod = job[0][12] if job[0][12] is not None else 0
    cpuQuota = job[0][13] if job[0][13] is not None else 0
    # this is like cpu shares but for memory
    memReservation = job[0][14] if job[0][14] is not None else ""
    autoRemove = job[0][15] if job[0][15] is not None else True
    pidsLimit = job[0][16] if job[0][16] is not None else 100
    networkName = job[0][17] if job[0][17] is not None else ""
    
    # if this is a job engine, just append the number to the name
    if(engine is not None and containerName != ""):
        containerName = containerName + "-" + str(engine)
        
    print("Timeout: " + str(timeout))
    print("Arguments: " + str(arguments))
    print("Script path: " + scriptPath)
    print("Image name: " + imageName)
    print("Container name: " + containerName)
    print("Memory limit: " + str(memoryLimit))
    print("CPUs to run on: " + str(cpusToRunOn))
    print("CPU shares: " + str(cpuShares))
    print("CPU period: " + str(cpuPeriod))
    print("CPU Quota: " + str(cpuQuota))
    print("Memory Reservation: " + str(memReservation))
    print("Auto remove: " + str(autoRemove))
    print("PIDs limit: " + str(pidsLimit))
    print("Network name: " + networkName)

    #have table set up and pulled in query here but need to just update command below
    # path here is the path to the script to run, only used for lock file
    command = "timeout --kill-after=10 " + str(timeout) + " python3 -m AutomatedScripts.Scripts.ScriptController -path " + scriptPath + " -jobId " + jobId + " -stepId " + stepId
    if(jobDetailsId is not None):
        command = command + " -jobDetailsId " + str(jobDetailsId)
    print("Command to run: " + command)

    # may need to add some stuff for networking...
        # jobs running database cleanup should not need full network access
        # jobs to get movies into db will need more access to outside...
        # redis job will only need redis access
        # could also try to make containers for those specific jobs?
    # restart policy?
    # user - what user to run the container as?

    try:
        result = dockerCli.containers.run(image=imageName, command='bash -c "' + command + '"',
        mounts=[mount], auto_remove=autoRemove, detach=True,environment=config, name=containerName,
        cpuset_cpus=cpusToRunOn, cpu_shares=cpuShares, cpu_period=cpuPeriod, cpu_quota=cpuQuota,
        mem_limit=memoryLimit, mem_reservation=memReservation, pids_limit=pidsLimit, network=networkName)
        print("Container started")
    except:
        print("ERROR CAUGHT")
        print(result)
        raise