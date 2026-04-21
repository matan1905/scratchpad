const adjectives = ['swift','quiet','bold','calm','dark','eager','fair','glad','hazy','icy','jolly','keen','lazy','merry','neat','odd','proud','quick','rare','shy','tiny','vast','warm','young','zesty','amber','blue','coral','dusty','fresh','golden','hidden','iron','jade','kind','lunar','misty','noble','pale','rusty','silver','twin','urban','vivid','wild','crimson','frosty','gentle'];
const nouns = ['fox','owl','bee','elk','ant','bat','cat','dog','eel','fly','gnu','hen','jay','koi','lion','moth','newt','orca','puma','quail','ram','seal','toad','vole','wolf','yak','cloud','stone','river','flame','storm','frost','leaf','moon','star','wave','wind','peak','vale','grove','spark','dream','echo','ghost','shade','thorn','brook','cliff'];

export function generateName(): string {
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  return `${a}-${n}`;
}
