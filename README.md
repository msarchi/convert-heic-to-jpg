# convert-heic-to-jpg

Applicazione web completa con frontend in React + MUI e backend in Node.js containerizzata con Docker per navigare in un file system Linux, selezionare una cartella e convertire immagini HEIC in JPG

## Uso

Esegui 
```bash
docker-compose up --build
```
dalla root del progetto per costruire e avviare i container.

## Configurazione

nel docker-compose.yml mappare il volume

```yaml
    volumes:
      - ./images:/app/images
```

cambiando la prima parte, che è il path sull'host

Accedi all'applicazione su http://localhost:3000.
