from configparser import ConfigParser
import os


# function used to read the database.ini file and get the parameters from it
# container is the string TRUE or FALSE
def config(environment, section):
    parser = ConfigParser()
    filename = ""
    if(environment == "DEV"):
        filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'dev-config.ini')
    elif(environment == "LOCAL-DEV"):
        filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'local-dev-config.ini')
    elif(environment == "PROD"):
        filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'prod-config.ini')
    else:
        raise Exception('Could not determine the config file for the current environment')
    parser.read(filename)
    db = {}
    if parser.has_section(section):
        # get the parameters for postgresql
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))
    return db
