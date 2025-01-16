export const getDuration = (startDate: string | undefined, endDate: string | undefined) => {
    if (!startDate || !endDate) return "N/A";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(durationInMs / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
  
    let durationString = '';
    if (years > 0) durationString += `${years} year${years !== 1 ? 's' : ''} `;
    if (months > 0) durationString += `${months} month${months !== 1 ? 's' : ''} `;
    if (days > 0) durationString += `${days} day${days !== 1 ? 's' : ''}`;
  
    return durationString.trim() || "0 days";  // Return "0 days" if no duration
  };