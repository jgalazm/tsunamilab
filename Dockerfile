FROM digitallyseamless/nodejs-bower-grunt 

COPY web /home/docker/tsunami-lab

RUN cd /home/docker/tsunami-lab/ && npm install

RUN cd /home/docker/tsunami-lab/ && bower install

RUN cd /home/docker/tsunami-lab/ && grunt --force

RUN apt-get update && apt-get install apache2 -y && apt-get clean

RUN mkdir /public_html && cp -r /home/docker/tsunami-lab/dist/* /public_html
