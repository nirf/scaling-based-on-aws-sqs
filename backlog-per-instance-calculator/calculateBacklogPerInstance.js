async function calculateBacklogPerInstance(event, context) {
  const time = new Date();
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);
}

export const handler = calculateBacklogPerInstance



