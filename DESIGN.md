### Why are you building this?
* In the past, I have tried using various todo-list apps (including [building my own](https://github.com/kaustubh-karkare/todolist)), but none of them really worked out for me: the motivation never seemed to last beyond a few days. The idea of an anti-todo or done-list seemed pretty interesting when I first encountered it in some blog post (maybe [this one](https://www.fastcompany.com/3034785/why-an-anti-to-do-list-might-be-the-secret-to-productivity)?). Back then, it was fairly easy to measure my productivity at work in terms of the amount of code generated, so I would only make notes about important/memorable events. But in the last couple of years, as my job has evolved, that metric is no longer a useful proxy for my effectiveness. This transition strongly correlated with an increasing reliance on these done-lists to feel satisfied at the end of the day.
* I have been using Evernote to manage these notes/lists for a few years, and now that I have a good understanding of how I like to use the tool, I find myself wishing for the ability to add more structure to the data being generated, so that I can do some interesting things with it. Looking at the options available online, I did not find anything that did everything I was hoping for, and more importantly, it hurts my pride as a [Software Engineer](https://www.linkedin.com/in/kaustubh-karkare/) to pay for something I know I can build. As a result, this tool might not be suited to a larger audience, but it will work for me :)

### What are your requirements?
* A stream of items, each associated with the date and optionally time (which isn't always available).
* Each item has some unstructured markdown text associated with it by default.
* Each item is also associated with structured information, instead of the more standard simple tags.
    * Based on the given input, the tool could require that you provide additional information based on hardcoded/configured rules, eg - For Category=Reading, which book? How many chapters? For Category=Meeting, with whom? About what?
    * Additionally, the ability to search for all items based on this structured data (which must therefore be indexed), and support for scripts to perform aggregate analysis / generate visualizations as needed (which are usually premium features).
* The ability to create todo-items (similar to done-items, but with optional date). The ability to schedule certain todo-items repeatedly with a specified frequency (which is a fairly standard feature).
* Random inspirational advice / reminders that has resonated for me.
* No need for mobile apps: I will be primarily interacting with this via a laptop.
* No need for a fancy UI: I am okay with something simple focussed on the text.
* No need for security: I can assume that this will only ever be used on localhost.

### What will the implementation look like?
* Technology?
    * Unlike most of my other side-projects, the goal here is not to experiment with and understand new technology. It is to use existing libraries to quickly create something that allows me to start generating useful structured data ASAP.
    * Planning to use [MySQL](https://www.mysql.com/) as a database (storing the data in Dropbox to generate a version history) and [NodeJS](https://nodejs.org/en/) for the server, [Sequelize](https://sequelize.org/) for the ORM, [SocketIO](https://socket.io/) for communiation, [ReactJS](https://reactjs.org/) for the webapp, [Bootstrap](https://getbootstrap.com/) for styling, and [TypeScript](https://www.typescriptlang.org/) for safety.
* Database schema?
    * Item: ID, Type (done/todo), Date, Index, Time, Title, Unstructured_Details
    * Structured_Details: ID, Key, Value
    * Association: N:N mapping between Item.ID and Structured_Details.ID
    * // Rules: Instead of a table, v1 will go with hardcoding these.
* Interface design?
    * Search bar at the top, supports filtering by date, title, structured details.
    * Vertically split screen at display the done-items and todo-items for current filters.
    * Stream of items, with each item compressed to one line by default. Expandable + editable.
    * Infinite scroll, but in the upward direction for older entries.
    * Form at the bottom for creating new items.
