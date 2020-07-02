const Sequelize = require('sequelize');

export default function (sequelize) {
    const options = {
        timestamps: false,
        underscored: true,
    };

    const LogTopicGroup = sequelize.define(
        'log_topic_groups',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['name'] },
            ],
        },
    );

    const LogTopic = sequelize.define(
        'log_topics',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            group_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            details: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['name'] },
            ],
        },
    );

    LogTopic.belongsTo(LogTopicGroup, {
        foreignKey: 'group_id',
        allowNull: false,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogStructure = sequelize.define(
        'log_structures',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            title_template: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            is_indirectly_managed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                comment: 'If true, this structure is tightly coupled with a reminder.',
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['name'] },
            ],
        },
    );

    const LogKey = sequelize.define(
        'log_keys',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['name'] },
            ],
        },
    );

    const LogStructureToLogKey = sequelize.define(
        'log_structures_to_log_keys',
        {
            structure_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogStructure,
                    key: 'id',
                },
            },
            key_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogKey,
                    key: 'id',
                },
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        options,
    );

    LogStructure.belongsToMany(LogKey, {
        through: LogStructureToLogKey,
        foreignKey: 'structure_id',
        // Allow the edge to be deleted with the structure.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogKey.belongsToMany(LogStructure, {
        through: LogStructureToLogKey,
        foreignKey: 'key_id',
        // Don't allow key to be deleted if there are
        // structures that depend on it.
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogValue = sequelize.define(
        'log_values',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            key_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            data: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['key_id', 'data'] },
            ],
        },
    );

    LogKey.hasMany(LogValue, {
        foreignKey: 'key_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogReminderGroup = sequelize.define(
        'log_reminder_groups',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            on_sidebar: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
        },
        options,
    );

    const LogReminder = sequelize.define(
        'log_reminders',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            group_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            title: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            deadline: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            warning: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            frequency: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            last_update: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            needs_edit: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            structure_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
        },
        options,
    );

    LogReminder.belongsTo(LogReminderGroup, {
        foreignKey: 'group_id',
        allowNull: false,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    LogReminder.belongsTo(LogStructure, {
        foreignKey: 'structure_id',
        allowNull: false,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    // Should this be called call LogEntry or LogEvent?
    // LogEvent indicates "events" and not all items in the list are actual events.
    // They might be random thoughts, or reminders, etc.
    const LogEntry = sequelize.define(
        'log_entries',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            structure_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            date: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Used for grouping.',
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Derived from Title, used for Search.',
            },
            title: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            details: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: '',
            },
        },
        options,
    );

    const LogEntryToLogTopic = sequelize.define(
        'log_entries_to_log_topics',
        {
            entry_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogEntry,
                    key: 'id',
                },
            },
            topic_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogTopic,
                    key: 'id',
                },
            },
        },
        options,
    );

    LogEntry.belongsToMany(LogTopic, {
        through: LogEntryToLogTopic,
        foreignKey: 'entry_id',
        // Deleteing an Entry is allowed!
        // The links will be broken, and the Tags could be cleaned up.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogTopic.belongsToMany(LogEntry, {
        through: LogEntryToLogTopic,
        foreignKey: 'topic_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    LogEntry.belongsTo(LogStructure, {
        foreignKey: 'structure_id',
        allowNull: true,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogEntryToLogValue = sequelize.define(
        'log_entries_to_log_values',
        {
            entry_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogEntry,
                    key: 'id',
                },
            },
            value_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogValue,
                    key: 'id',
                },
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        options,
    );

    LogEntry.belongsToMany(LogValue, {
        through: LogEntryToLogValue,
        foreignKey: 'entry_id',
        // Deleteing an Entry is allowed!
        // The links will be broken, and the Values could be cleaned up.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogValue.belongsToMany(LogEntry, {
        through: LogEntryToLogValue,
        foreignKey: 'value_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    // The following sequence of models is used to load data from backups
    // while respecting foreign key constraints.
    return [
        ['LogTopicGroup', LogTopicGroup],
        ['LogTopic', LogTopic],
        ['LogStructure', LogStructure],
        ['LogKey', LogKey],
        ['LogStructureToLogKey', LogStructureToLogKey],
        ['LogValue', LogValue],
        ['LogReminderGroup', LogReminderGroup],
        ['LogReminder', LogReminder],
        ['LogEntry', LogEntry],
        ['LogEntryToLogTopic', LogEntryToLogTopic],
        ['LogEntryToLogValue', LogEntryToLogValue],
    ];
}
