FROM nginx:latest

# Install envsubst
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

# Copy the template configuration file
COPY nginx.conf /etc/nginx/nginx.conf.template

# Use envsubst to generate the final configuration file
CMD envsubst '$SERVER_IP' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'

EXPOSE 80
