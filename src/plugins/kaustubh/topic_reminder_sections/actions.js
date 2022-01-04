/* eslint-disable func-names */

import { differenceInCalendarDays } from 'date-fns';

import DateUtils from '../../../common/DateUtils';
import RichTextUtils from '../../../common/RichTextUtils';

const ActionsRegistry = {};

ActionsRegistry['topic-reminders'] = async function ({
    todayLabel,
    logStructureId,
    thresholdDays,
}) {
    const logStructure = await this.invoke.call(
        this,
        'log-structure-load',
        { __id__: logStructureId },
    );
    const todayDate = DateUtils.getDate(todayLabel);
    const logTopics = Object.values(
        RichTextUtils.extractMentions(logStructure.details, 'log-topic'),
    );
    const logTopicAndDayCounts = await Promise.all(logTopics.map(async (logTopic) => {
        // TODO: Fetch only the latest item from the database.
        const logEvents = await this.invoke.call(
            this,
            'log-event-list',
            {
                where: { logStructure, logTopics: [logTopic], isComplete: true },
                limit: 1,
            },
        );
        const logEvent = logEvents.pop();
        let dayCount = null;
        let needsReminder = true;
        if (logEvent) {
            const lastDate = DateUtils.getDate(logEvent.date);
            dayCount = differenceInCalendarDays(todayDate, lastDate);
            needsReminder = dayCount > thresholdDays;
        }
        return needsReminder ? { logTopic, dayCount } : null;
    }));
    return { logStructure, logTopicAndDayCounts: logTopicAndDayCounts.filter((item) => item) };
};

export default ActionsRegistry;
