### Rationale
* In the past, I have tried using various todo-list apps (including [building my own](https://github.com/kaustubh-karkare/todolist)), but none of them really worked out for me: the motivation never seemed to last beyond a few days. The idea of an anti-todo or done-list seemed pretty interesting when I first encountered it in some blog post (maybe [this one](https://www.fastcompany.com/3034785/why-an-anti-to-do-list-might-be-the-secret-to-productivity)?). Back then, it was fairly easy to measure my productivity at work in terms of the amount of code generated, so I would only make notes about important/memorable events. But in the last couple of years, as my job has evolved, that metric is no longer a useful proxy for my effectiveness. This transition strongly correlated with an increasing reliance on these done-lists to feel satisfied at the end of the day.
* I have been using Evernote to manage these notes/lists for a few years, and now that I have a good understanding of how I like to use the tool, I find myself wishing for the ability to add more structure to the data being generated, so that I can do some interesting things with it. Looking at the options available online, I did not find anything that did everything I was hoping for, and more importantly, it hurts my pride as a [Software Engineer](https://www.linkedin.com/in/kaustubh-karkare/) to pay for something I know I can build. As a result, this tool might not be suited to a larger audience, but it will work for me :)

### Installation

```
git clone https://github.com/kaustubh-karkare/productivity
cp config.json.example config.json
mkdir data # config.json specifies this as the database & backup location.
yarn install
yarn run build
yarn run server
```

### Data Format Change

```
yarn run backup-save
git pull
# maybe modify the backup data
yarn run backup-load
```
