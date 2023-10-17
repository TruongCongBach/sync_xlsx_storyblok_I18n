### ENV
please log in on storyblok get authorization from network
change for authorization config

### Storyblok Command Line Interface
install storyblok command line
```bash
  npm i storyblok -g
```
login
```bash 
  storyblok login
```
pull component json
```bash
  storyblok pull-components --space <SPACE_ID>
```

push component json (path file)
```bash
  storyblok push-components --space <DEST_SPACE_ID> {{path/url}}
```

You can sync components, folders, roles, datasources or stories between spaces.
```bash
  storyblok sync --type <COMMAND> --source <SPACE_ID> --target <SPACE_ID> 
```
Other command line interface
https://www.storyblok.com/docs/Guides/command-line-interface


```bash
  storyblok push-components --space 235422 components.230770.json
```