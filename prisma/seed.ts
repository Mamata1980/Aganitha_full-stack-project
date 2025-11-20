import prisma from "../lib/prisma";

async function main(){
  await prisma.link.createMany({
    data: [
      { code: "example1", url: "https://example.com/1" },
      { code: "example2", url: "https://example.com/2" },
    ],
    skipDuplicates: true
  });
  console.log("Seed done");
}

main()
  .catch(e=>{console.error(e); process.exit(1)})
  .finally(()=>prisma.$disconnect());
