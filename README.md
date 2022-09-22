# oktavia
GitHub repository for Oktavia project, working for Junior CentraleSupélec.

## Lancement avec Docker
Après avoir installé Docker sur votre machine, pour build le projet et ses dépendances, ouvrez le terminal à sa racine et entrez la commande :
```bash
docker build -t oktavia -f Dockerfile .
```
Puis, pour lancer le serveur, entrez la commande:
```bash
docker run -p 49160:8080 -d oktavia
```
Pour afficher les logs du serveur, entrez la commande:
```bash
docker logs <identifiant-image-docker>
```
Pour ouvrir la console du conteneur, entrez la commande:
```bash
docker exec -it <identifiant-image-docker> /bin/bash
```

