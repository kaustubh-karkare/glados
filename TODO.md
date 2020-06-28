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

### Minor Features
* LogReminderCheckList should have a collapse button to suppress distractions.
* Add LogReminder.show_on_sidebar? Certain miscellaneous categories are never ending.
* Add LogEntry.is_minor, so that the minor ones can be hidden from the main view.
* Figure out UI for LogEntry.is_minor so that it is easy to toggle between the 2 modes.
* Add LogTag.details, to maybe store more information about specific people.
* Validation: For periodic reminders, are structures necessary?
* Validation: Typeahead can immediately reject more invalid suggestions.
* Figure out how to run this in the background as a deamon?
* Security: Require a password specified in config.json
* Allow LogReminders to be created directly from the LogEntryAdder.

### Major Bugs
* TextEditor suggestions only work with trigger character, no subsequent ones.
* LogCategory.keys[].name or LogTag.name updates should propagate to LogEntries.
* LogCategory.keys: Block updates if LogEntries would become inconsistent.
* TemplateUtils.substituteValuesIntoDraftContent should generate proper

### Minor Bugs
* For LogCategory.ExpandedViewerComponent, highlight the keys in the template.
* When the modal closes, the item with focus isn't notified, so not highlighted.
* BulletList.AdderComponent does not invoke validation!
* When pasting markdown with multiple layers of indenting, it do not work.

### Code Quality
* Split Actions.js to get separate files for standard, custom, and wrapper.
* Rename LogTag to LogReferences?
* Avoid unnecessary reloading of data across save/load methods.
* Clean up dependencies and provide easy install/usage instructions.

Additionally, look for TODO comments in the code!
