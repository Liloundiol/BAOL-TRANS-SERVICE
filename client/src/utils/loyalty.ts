export const calculateLoyalty = (reservationsCount: number) => {
  const points = reservationsCount * 10;
  
  let status = "Nouveau Client";
  let tier = "Bronze";
  
  if (reservationsCount >= 15) {
    status = "Client VIP";
    tier = "Or";
  } else if (reservationsCount >= 5) {
    status = "Client Régulier";
    tier = "Argent";
  }
  
  return { points, status, tier };
};
