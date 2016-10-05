Run the following commands to generate a public_html file with the compiled version of the application.
Make sure to git pull before building the image.

docker build -t tusudocker .
docker run -d --name tusucontainer tusudocker tail -f /dev/null
docker cp tusucontainer:/public_html .
