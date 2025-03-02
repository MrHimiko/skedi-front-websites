import dayjs from 'dayjs'

function getLogDates(logs)
{
    const dates = {};

    logs.forEach((log) =>
    {
        const time = dayjs(log.time).format('MMM D, YYYY');

        if (!(time in dates))
        {
            dates[time] = [];
        }

        dates[time].push(log);
    });

    return Object.keys(dates).map((date) =>
    {
        return { date: date, logs: dates[date] };
    })
}

export 
{
    getLogDates
}