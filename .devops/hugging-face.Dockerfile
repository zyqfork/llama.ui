FROM ghcr.io/olegshulyakov/llama.ui:latest

# Copy custom nginx config
COPY --chown=1000 nginx.conf /etc/nginx/conf.d/default.conf

# Create necessary cache directories with proper permissions
RUN chown -R 1000:1000 /var/cache/nginx && \
    chown -R 1000:1000 /run

USER 1000

# Expose port 7860
EXPOSE 7860

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]