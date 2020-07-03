### Major Features
* Final Layout
    * Need blank space for random unorganized notes before creating entries.
* Search
    * Eliminates need for infinite backward scroll for dates.
    * Eliminates need for special view for searching by category/tag.
* Backup
    * Switch to Sqlite files for easy management?
    * Auto-save using localStorage in the browser?
* Media
    * Figure out how to save images/videos/files in the system?
* Importing Legacy Data
    * What happens if I don't know the dates of historical events?
    * Need to spend some time here to import this data.

### Minor Features
* Auto-generate topics from structures.
* Favorite topics bar.
* Add more options for TextEditor mention suggestions!
* Create modal for renders information about specific topic. List of relevant events + details form.
* Add LogEntry.is_minor, so that the minor ones can be hidden from the main view.
* Figure out UI for LogEntry.is_minor so that it is easy to toggle between the 2 modes.
* Add LogEntry.is_resolved, so indicate items are the still pending resolution. Helps with active deliveries.
* Add a button on the UI that triggers consistency check of custom rules!
* Add a button on the UI that triggers creation of backups.
* Client should be aware of the current mode (test vs prod).
* Provide more LogKeyTypes: Yes/No. Specific Time Vs Duration
* LogReminderCheckList should have a collapse button to suppress distractions.
* Add LogTag.details, to maybe store more information about specific people.
* Figure out how to run this in the background as a deamon?
* Security: Require a password specified in config.json
* Figure out the smallest size serialization format before writing to DB.
* LogTag.alias? To refer to people like Aai / Baba.
* Sort typeahead suggestions by frequency.

### Major Bugs
* Updating title/details of LogEntry does not update BulletList.
* LogCategory.keys: Block updates if LogEntries would become inconsistent.
* TemplateUtils.substituteValuesIntoDraftContent should generate proper draft content.

### Minor Bugs
* For LogCategory.ExpandedViewerComponent, highlight the keys in the template.
* When the modal closes, the item with focus isn't notified, so not highlighted.
* BulletList.AdderComponent does not invoke validation!

### Code Quality
* Get the bootstrap.min.css file out of the repository!
* Move propTypes to data files.
* Lets just use a single character for suggestions with smarter rendering.
* Avoid unnecessary reloading of data across save/load methods.
* Clean up dependencies and provide easy install/usage instructions.
* Rename LogEntry to LogEvent, now that Reminders are a separate concept.

### Ideas
* Priorities?

Additionally, look for TODO comments in the code!
