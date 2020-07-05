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
* Create miscellaneous notes section.
* Auto-generate topics from structures.
* Add more options for TextEditor mention suggestions!
* Add LogEntry.is_resolved, so indicate items are the still pending resolution. Helps with active deliveries.
* Add a button on the UI that triggers consistency check of custom rules!
* Add a button on the UI that triggers creation of backups.
* Provide more LogKeyTypes: Yes/No. Specific Time Vs Duration
* LogReminderCheckList should have a collapse button to suppress distractions.
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

### Code Quality
* Create common component to render LogTopic.
* Clean up the global state (ModalStack / LogTopicDetails).
* Get the bootstrap.min.css file out of the repository!
* Move propTypes to data files.
* Lets just use a single character for suggestions with smarter rendering.
* Avoid unnecessary reloading of data across save/load methods.
* Clean up dependencies and provide easy install/usage instructions.
* Rename LogEntry to LogEvent, now that Reminders are a separate concept.

### Ideas
* Priorities?

Additionally, look for TODO comments in the code!
