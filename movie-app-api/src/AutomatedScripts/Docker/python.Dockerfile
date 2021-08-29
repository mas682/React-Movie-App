FROM python
WORKDIR /home
# install the python modules needed
COPY requirements.txt ./
RUN pip3 install -r requirements.txt
#CMD ["bash"]