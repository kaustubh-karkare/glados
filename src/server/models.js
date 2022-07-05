const Sequelize = require('sequelize');

export function getDataFormatVersion() {
    // This value is used to ensure that the backup file being loaded
    // is still compatible with this version of code.
    // In case of database schema changes, this value should be bumped,
    // and a script can be written to generate a new backup file from an older version.
    return '100';
}

export function getDataModels(sequelize) {
    const options = {
        timestamps: false,
        underscored: true,
    };

    const Settings = sequelize.define(
        'settings',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            key: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            value: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['key'] },
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
            parent_topic_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
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
            child_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            is_favorite: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            is_deprecated: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            // Keys & Values
            child_keys: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            child_name_template: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            parent_values: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        },
        {
            ...options,
            indexes: [
                { unique: true, fields: ['name'] },
            ],
        },
    );

    LogTopic.belongsTo(LogTopic, {
        foreignKey: 'parent_topic_id',
        allowNull: true,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogTopicToLogTopic = sequelize.define(
        'log_topics_to_log_topics',
        {
            source_topic_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogTopic,
                    key: 'id',
                },
            },
            target_topic_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogTopic,
                    key: 'id',
                },
            },
        },
        options,
    );

    LogTopic.belongsToMany(LogTopic, {
        as: 'Source',
        through: LogTopicToLogTopic,
        foreignKey: 'source_topic_id',
        // Deleteing a source topic is allowed!
        // The links will be broken, and the Tags could be cleaned up.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogTopic.belongsToMany(LogTopic, {
        as: 'Target',
        through: LogTopicToLogTopic,
        foreignKey: 'target_topic_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogStructureGroup = sequelize.define(
        'log_structure_groups',
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
        options,
    );

    const LogStructure = sequelize.define(
        'log_structures',
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
            // Should this structure have key-value-pairs?
            event_keys: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            event_title_template: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            event_needs_edit: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            event_allow_details: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            // Should this structure have reminders?
            is_periodic: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            reminder_text: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            frequency: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            frequency_args: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            warning_days: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            suppress_until_date: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            // Additional fields to be copied to events.
            log_level: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            is_favorite: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            is_deprecated: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
        },
        options,
    );

    LogStructure.belongsTo(LogStructureGroup, {
        foreignKey: 'group_id',
        allowNull: false,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogStructureToLogTopic = sequelize.define(
        'log_structures_to_log_topics',
        {
            source_structure_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogStructure,
                    key: 'id',
                },
            },
            target_topic_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogTopic,
                    key: 'id',
                },
            },
        },
        options,
    );

    LogStructure.belongsToMany(LogTopic, {
        through: LogStructureToLogTopic,
        foreignKey: 'source_structure_id',
        // Deleteing an structure is allowed!
        // The links will be broken, and the Tags could be cleaned up.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogTopic.belongsToMany(LogStructure, {
        through: LogStructureToLogTopic,
        foreignKey: 'target_topic_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    // Estimated scale? 50 events per day * 365 days * 10 years = 182,500 events
    // Size of 1 event? 1 kb, so total size over 10 years ~= 200mb
    const LogEvent = sequelize.define(
        'log_events',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            date: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            ordering_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            title: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            structure_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            structure_values: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            details: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            log_level: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            is_favorite: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            is_complete: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
        },
        options,
    );

    LogEvent.belongsTo(LogStructure, {
        foreignKey: 'structure_id',
        allowNull: true,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    const LogEventToLogTopic = sequelize.define(
        'log_events_to_log_topics',
        {
            source_event_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogEvent,
                    key: 'id',
                },
            },
            target_topic_id: {
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
        foreignKey: 'source_event_id',
        // Deleteing an event is allowed!
        // The links will be broken, and the Tags could be cleaned up.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogTopic.belongsToMany(LogEvent, {
        through: LogEventToLogTopic,
        foreignKey: 'target_topic_id',
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    // The following sequence of models is used to load data from backups
    // while respecting foreign key constraints.
    return [
        ['Settings', Settings],
        ['LogTopic', LogTopic],
        ['LogTopicToLogTopic', LogTopicToLogTopic],
        ['LogStructureGroup', LogStructureGroup],
        ['LogStructure', LogStructure],
        ['LogStructureToLogTopic', LogStructureToLogTopic],
        ['LogEvent', LogEvent],
        ['LogEventToLogTopic', LogEventToLogTopic],
    ];
}
