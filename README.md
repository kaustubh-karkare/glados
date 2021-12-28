## Generic Life Activity Data Organization System (GLADOS)

### Rationale
* In the past, I have tried using various todo-list apps (including [building my own](https://github.com/kaustubh-karkare/todolist)), but none of them really worked out for me: the motivation never seemed to last beyond a few days. But the idea of an anti-todo/done-list seemed pretty interesting when I first encountered it in some blog post (maybe [this one](https://www.fastcompany.com/3034785/why-an-anti-to-do-list-might-be-the-secret-to-productivity)?).
* Additionally, back then, it was fairly easy to measure my productivity at work in terms of the amount of code generated, so I would only make notes about important/memorable events. But in the last couple of years, as my job has evolved, that metric is no longer a useful proxy for my effectiveness. This transition strongly correlated with an increasing reliance on these done-lists to feel satisfied at the end of the day.
* I have been using Evernote to manage these notes/lists for a few years, and now that I have a good understanding of how I like to use the tool, I find myself wishing for the ability to add more structure to the data being generated, so that I can do some interesting things with it.
* Looking at the options available online, I did not find anything that did everything I was hoping for, and more importantly, it hurts my pride as a [Software Engineer](https://www.linkedin.com/in/kaustubh-karkare/) to pay for something I know I can build. As a result, this tool might not be suited to a larger audience, but it will work for me :)

### Warning!

* This tool is continuously being modified as I discover what works for me and what doesn't. This includes changes to not only the UI, but to the database schema too. And I do NOT plan to support automatic data migrations when these database modifications happen.
* I do not recommend using this tool, unless you are able to write the code necessary to update your data according to the new schema. For what it is worth, this should not be particularly difficult using the "Backup" files described later.

### Installation

```
git clone https://github.com/kaustubh-karkare/glados
cp config/example.glados.example config.json
mkdir data
yarn install
yarn run build
yarn run database-reset
```

* The default `config.json` file specifies the `data` subdirectory as the location of the SQLite database and the backups.
* I personally made `data` a symlink to another directory that synced to my [Dropbox](https://www.dropbox.com/).
* You can change the config to use whatever storage you want, as long as it is compatible with [Sequelize](https://sequelize.org/).

### Demo

* In order to show off what I have built, I used to manually create videos by recording my screen as I performed a predetermined set of actions. This was obviously very fragile and involved multiple attempts until I finally made no mistakes.
* I got annoyed at this process, and so automated the whole thing using [Selenium Webdriver](https://www.selenium.dev/selenium/docs/api/javascript/index.html) and [ffmpeg](https://www.ffmpeg.org/).

```
yarn run demo
```

* An auxiliary benefit here is that this functionality can be used as an E2E test for this codebase.

### Usage

```
yarn run server
```

### Backups

```
yarn run backup-save
yarn run backup-load  # This involves a database reset, so be careful!
```

* Backup files are created by loading the entire database into memory and then writing that as a JSON file.
* This makes it very easy to apply transformations on the entire database when needed. Eg - if new columns are added, or the data needs to be reorganized.
* These are also useful if data needs to be moved from one storage to another.
