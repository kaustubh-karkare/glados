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
            on_sidebar: {
                type: Sequelize.BOOLEAN,
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
            keys: {
                type: Sequelize.TEXT,
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

    // Should this be called call LogEvent or LogEvent?
    // LogEvent indicates "events" and not all items in the list are actual events.
    // They might be random thoughts, or reminders, etc.
    const LogEvent = sequelize.define(
        'log_entries',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
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
            structure_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            structure_values: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        },
        options,
    );

    const LogEventToLogTopic = sequelize.define(
        'log_events_to_log_topics',
        {
            event_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogEvent,
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

    LogEvent.belongsToMany(LogTopic, {
        through: LogEventToLogTopic,
        foreignKey: 'event_id',
        // Deleteing an event is allowed!
        // The links will be broken, and the Tags could be cleaned up.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogTopic.belongsToMany(LogEvent, {
        through: LogEventToLogTopic,
        foreignKey: 'topic_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    LogEvent.belongsTo(LogStructure, {
        foreignKey: 'structure_id',
        allowNull: true,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    // The following sequence of models is used to load data from backups
    // while respecting foreign key constraints.
    return [
        ['LogTopicGroup', LogTopicGroup],
        ['LogTopic', LogTopic],
        ['LogStructure', LogStructure],
        ['LogReminderGroup', LogReminderGroup],
        ['LogReminder', LogReminder],
        ['LogEvent', LogEvent],
        ['LogEventToLogTopic', LogEventToLogTopic],
    ];
}
