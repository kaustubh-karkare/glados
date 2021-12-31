## Generic Life Activity Data Organization System (GLADOS)

https://user-images.githubusercontent.com/1102450/147816494-335b2033-a110-4eca-8c2c-2956fa788426.mp4

### Rationale
* Over the past decade, I have tried using various todo-list apps (including [my own](https://github.com/kaustubh-karkare/todolist)), but none of them really worked out for me: the motivation never seemed to last beyond a few days. But when I first encountered the idea of an anti-todo/done-list in some blog post (maybe [this one](https://www.fastcompany.com/3034785/why-an-anti-to-do-list-might-be-the-secret-to-productivity)?) I was fascinated enough to give it a try, and at last, it stuck!
* Additionally, back then, it was fairly easy to measure my productivity at work in terms of the amount of code generated, so I would only make notes about important/memorable events. But in the last couple of years, as my job has evolved, that metric is no longer a useful proxy for my effectiveness. This transition strongly correlated with an increasing reliance on these done-lists to feel satisfied at the end of the day.
* I have been using Evernote to manage these notes/lists for a few years, and now that I have a good understanding of how I like to use the tool, I find myself wishing for the ability to add more structure to the data being generated, so that I can do some interesting things with it. Eg -
* Looking at the options available online, I did not find anything that did everything I was hoping for, and more importantly, it hurts my pride as a [Software Engineer](https://www.linkedin.com/in/kaustubh-karkare/) to pay for something I know I can build. I also did not like the idea of relying on an external product that might go out of business at some point in the future: having complete control over my data was one of the design goals. As a result, this tool might not be suited to a larger audience, but it will work for me! :)

### Warning!

* Since it is primarily designed for an audience of one, this tool is continuously being modified as I discover bugs or find new ways to improve my workflow. It most definitely is NOT perfect, containing edge cases and bugs that I have not yet encountered, despite having used it almost daily since July 2020.

### Installation & Usage

```
git clone https://github.com/kaustubh-karkare/glados
cd glados
cp config/example.glados.json config.json
mkdir data
yarn install
yarn run build
yarn run database-reset
```

* The default `config.json` file specifies the `data` subdirectory as the location of the SQLite database and the backups.
* I personally made `data` a symlink to another directory that synced to my [Dropbox](https://www.dropbox.com/).
* You can change the config to use whatever storage you want, as long as it is compatible with [Sequelize](https://sequelize.org/).
* And once you're ready,

```
yarn run server
```

### Demo

* In order to show off what I have built, I used to manually create videos by recording my screen as I performed a predetermined set of actions. This was obviously very fragile and involved multiple attempts until I finally made no mistakes.
* I got annoyed at this process, and so automated the whole thing using [Selenium Webdriver](https://www.selenium.dev/selenium/docs/api/javascript/index.html) to perform those actions and [ffmpeg](https://www.ffmpeg.org/) to record that part of the screen.

```
yarn run demo
```

* An auxiliary benefit here is that this functionality can be used as an E2E test for this codebase.

### Backups

```
yarn run backup-save  # Can also be done via the right-sidebar in the UI.
yarn run backup-load  # This involves a database reset, so be careful!
```

* Backup files are created by loading the entire database into memory (~10MB for me right now) and then writing that as a JSON file.
* This makes it very easy to apply transformations on the entire database when needed. Eg - the database schema has been updated, or if you just want to change how you organize your data.
* These are also useful if data needs to be moved from one storage to another.
