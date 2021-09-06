# 8/31/2021
# Matt Stropkey
# This script is used to run the jobs in the queue.  It will first check to see how many 
# job containers are running.  If not at the maximum number of containers to run, see if 
# there is work to do and start a eninge container
# command to run(will have to change jobId and stepId):
# ran from the src folder
# python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.EngineControl -jobId 1 -stepId 3

import docker
import os
from dotenv import dotenv_values


def getQueuedJob(db, server, engine):
    # call out to mark a job for the engine
    script = """
        call public."GetJobQueueLock"('""" + server + """',""" + engine + """);
    """
    print("Executing query: " + script)
    db._cur.execute(script)
    # get the job that was marked
    script = """
        select 
            j."id" as "JobQueueId",
            j."jobId",
            j."stepId",
            js."type",
            js."timeout",
            js."arguments",
            js."scriptPath"
        from public."JobQueue" j
        left join public."ScheduledJobs" s on s."id" = j."jobId"
        left join public."JobSteps" js on js."id" = j."stepId"
        where j."engine" = """ + engine + """
        and j."server" = '""" + server + """'
        and j.pending
        and (((EXTRACT(EPOCH FROM(CURRENT_TIMESTAMP - j."assignedAt"))::integer)/60) < 2)
        order by j."assignedAt" desc
        limit 1
    """
    print("Executing query: " + script)
    db._cur.execute(script)
    result = db._cur.fetchall()
    print(result)
    return result

def startDockerContainer(dockerCli, job, engine, environment):
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
    config["ENGINE"] = str(engine)

    dockerCli.containers.run(image='python-engine', command='bash -c "python3 -m AutomatedScripts.Scripts.ScriptController -path AutomatedScripts.Scripts.Jobs.Test -jobId 1 -stepId 3"',
     mounts=[mount], auto_remove=False, detach=True,environment=config, name="job-engine-" + str(engine))

def main(logger, db, extras, jobId, jobDetailsId):
    # fix how loc file is working.....
    # should not lock on failed job...
    dockerCli = docker.from_env()
    server = os.getenv('SERVER')
    environment = os.getenv('ENVIRONMENT')
    if(server is None):
        server = "Unknown"
    # get the running containers that were started from the python-engine image
    containers = dockerCli.containers.list(filters={'ancestor':'python-engine'})
    print("Containers running:")
    print(containers)
    print("Running containers: " + str(len(containers)))

    # remove any python-engine containers that are not running
    containersToRemove = dockerCli.containers.list(filters={'ancestor':'python-engine', 'status':'exited'})
    print("\nContainers not running: " + str(len(containersToRemove)))
    print(containersToRemove)
    for container in containersToRemove:
        print("Removing container: " + container.name)
        container.remove()


    # need to get this from the database?
    numContainersToRun = 8
    # if less than max containers are running
    if(len(containers) < numContainersToRun):
        # may need to pass job id to job itself so that it removes it from the 
        # queue once it is done...
        # if the engine could not be started, do not mark the job as done?
        # may actually want to do this after you see how many slots are avaialble?
        # then call to database one by one to get a job and assign it to an engine?
        counter = 1
        keys = {}
        # create a dictionary of all the eninge number keys
        while(counter <= numContainersToRun):
            keys[str(counter)] = True
            counter = counter + 1
        print("\nStripping engine numbers from containers currently running:")
        # iterate through the active engines to see which numbers are in use
        for container in containers:
            name = container.name
            # get the characters after job-engine-
            engine = name[11:]
            print(engine)
            del keys[engine]
        print(keys)

        # iterate through the available engines to try to start them
        for engine in keys:
            # get a job from the queue for this server/engine pair
            result = getQueuedJob(db, server, engine)
            # if no job was returned, done trying to assign jobs
            if(len(result) < 1):
                break
            startDockerContainer(dockerCli, result, engine, environment)
            break
            
        # at this point, use the keys available to start engines
        # if a conatiner already exists with the specified name, a error will be thrown 
        # when starting the engine
        # in which case, either rename or remove the existing container as long as it is not 
        # running then try to start the container again
        # just iterate through unused keys to assign to engines...

        # call database to get at most x jobs to do
        # mark the jobs as pending
        # once jobs started, mark them as started
        # if failed to start any, unmark those jobs as pending
        # pass job id to job itself
        # if a job fails to start on one engine, try the next one
        # keep a dictionary of job id, engine id
            # only storing engine if the job was actually started

        # for scalability, going to request job at a time
        # when a job is requested, mark it as pending
        # once job is started, remove pending flag

        #select * from public."JobQueue" j
        #where j."engine" = 1
        #and j."server" = 'test'
        #and j.pending
        #and (((EXTRACT(EPOCH FROM(CURRENT_TIMESTAMP - j."assignedAt"))::integer)/60) < 2)
        #order by j."assignedAt" desc
        #limit 1
        #procedure = can do a transaction but limited in what it can return
        #function = can return stuff but cannot do a transaction
        # - don't think a function can execute a procedure

    # control how many containers should be running from database
    # check which containers are running
    # function to do that

    # check if there are any jobs in the queue

    # if jobs, start containers for
    print("Test")

    return "Finished Successfully"