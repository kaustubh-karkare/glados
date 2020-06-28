const Sequelize = require('sequelize');

export default function (sequelize) {
    const options = {
        timestamps: false,
        underscored: true,
    };

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
                defaultValue: '',
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

    LogStructure.hasMany(LogEntry, {
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

    const LogTag = sequelize.define(
        'log_tags',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: Sequelize.STRING,
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
                { unique: true, fields: ['type', 'name'] },
            ],
        },
    );

    const LogEntryToLogTag = sequelize.define(
        'log_entries_to_log_tags',
        {
            entry_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogEntry,
                    key: 'id',
                },
            },
            tag_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: LogTag,
                    key: 'id',
                },
            },
        },
        options,
    );

    LogEntry.belongsToMany(LogTag, {
        through: LogEntryToLogTag,
        foreignKey: 'entry_id',
        // Deleteing an Entry is allowed!
        // The links will be broken, and the Tags could be cleaned up.
        onDelete: 'cascade',
        onUpdate: 'cascade',
    });

    LogTag.belongsToMany(LogEntry, {
        through: LogEntryToLogTag,
        foreignKey: 'tag_id',
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
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
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
            entry_id: {
                type: Sequelize.INTEGER,
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
        },
        options,
    );

    LogReminderGroup.hasOne(LogReminder, {
        foreignKey: 'group_id',
        allowNull: false,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    // LogReminder points to LogEntry so that they can be easily searched
    // for relevant items, and easily deleted.
    LogEntry.hasOne(LogReminder, {
        foreignKey: 'entry_id',
        allowNull: false,
        onDelete: 'restrict',
        onUpdate: 'restrict',
    });

    return {
        LogStructure,
        LogKey,
        LogStructureToLogKey,
        LogValue,
        LogEntry,
        LogEntryToLogValue,
        LogTag,
        LogEntryToLogTag,
        LogReminderGroup,
        LogReminder,
    };
}
