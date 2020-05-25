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
    * LogEntry
        * ID
        * Title. Summary of what I did.
        * Details. More details about what I did. Markdown, supports tags.
        * Category.
        * Index. Used for relative ordering within a single date.
        * Date. Main grouping!
        * Time. Further grouping?
        * Deadline? If present, this item is at top of suggeetsion list.
        * Status. enum(completed, in_progress, abandoned, pending, failed)
        * Priority. enum(wishlist, low, normal, high, critical)
        * Verbosity? Don't render if completed.
    * 1:N mapping between Entries and Categories.
    * Categories
        * ID
        * Name
    * N:N mapping between Categories and Keys.
        * Category ID
        * Key ID
        * Default Ordering Index
        * // Key groups to share multiple keys across items?
    * LESD Keys
        * ID
        * Key Name
        * Value Type = enum(number, string, link, enum)
        * Color? For syntax highlighting maybe.
    * N:N mapping between Entries and Values.
        * When will multiple entries point to same value?
            * Same book, being read across days.
            * Same TV show, seen across multiple spisodes.
        * Ordering Index.
    * LESD Values
        * ID
        * Key ID
        * Value, depends on Value Type (defined on Key).
    * Periodic Log Entry
        * Name
        * Category
        * Frequency = daily, weekdays, mondays
        * Priority
        * Verbosity
        * Order Index. Determines ordering in left sidebar.
    * Tags
        * Name. Used for mentions in unstructured details.
    * N:N mapping between log entries and tags.
* Actions
    * Category.
        * Create category.
        * Rename category. Easy.
        * Edit keys. Adding keys only works if all existing entries have that value already.
        * Delete category. Values corresponding to entries for that category are unchanged.
    * Log Entry.
        * Create entry.
        * Edit entry (any field).
        * Delete entry.
    * Search
        * By category, tags, structured data, date.
        * Slow search by unstructured text.
    * Consistency
        * Verify that all log entries have the structured data based on their category.
        * Verify that all tags mentioned in unstructured text appear in mapping.
* Components
    * Search Bar
        * Tokenizer Search supporting complex filters.
            * First iteration could be simple with a dropdown to select field.
    * Log View
        * Log Entry.
            * Edit mode contains the form.
            * View mode just displays a single line, with details on hover.
        * Log List (sequence of ordered log entries)
            * Allows bulk select and bulk actions on log entries. Eg - updating status.
            * Infinite Scroll Upwards.
    * Category View
        * Category
            * Allows creation of new category and editting of existing ones.
        * Category List (ordered by name)
    * Reference Lists
        * Books
        * Movies
        * Anime
        * Television
        * Articles
        * Exercise
        * Food Recipes / Accomplishments.
        * Bucket List
    * Left Sidebar (specific item suggestions)
        * Periodic Items
        * Random pending Suggestions. Button to load log entry.
    * Right Sidebar (analytics)
        * Exercise Graphs
        * Random Motivation Quotes.
        * Time since last backup.
        * Time since last consistency checks.
    * Generic
        * Collapsable section.
        * Graph?
        * Markdown Editor with Tagging Support.
        * Datetime Edtior.
* Random Thoughts
    * Category 0 is Uncategorized.
    * Monospace font (Consolas), small size, black & green/blue/red theme.
    * Category Ideas
        * Exercise > Cycling. Time (minutes), Distance (miles), Calories.
        * Exercise > Suryanamaskar. Count.
        * Entertainment > Movie
        * Reading > Literature. Name? Summary.
        * Reading > Education. Link is necessary.
        * Writing > Story Ideas.
        * Writing > Blogs.
        * Travel Logs
    * Certain entrie are associated with time, and others are not.
        * It might be useful to track when an item was created.
        * Certain items are timeless.
        * Separation of creation time vs completion time?
    * How do I deal with media?
    * Backups on browser localstorage.
    * Database backup story is crritial before active usage.
