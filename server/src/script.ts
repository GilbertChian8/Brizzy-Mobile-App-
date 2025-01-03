import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // //Create User Test
  // const user = await prisma.user.create({
  //   data: {
  //     email: "wicenagain@gmail.com",
  //     name: "wicen2",
  //     password: "wichien",
  //   },
  // });

  // console.log("Created user:", user);

  // //Create Plan Test
  // const plan = await prisma.plan.create({
  //   data: {
  //     title: "Moreton Island Again",
  //     description: "trust me it will be a nice trip.",
  //     cost: 1.0181,
  //     createdBy: {
  //       connect: { id: user.id },
  //     },
  //   },
  // });

  // console.log("Created plan:", plan);

  // //Update Test
  // const updatedUser = await prisma.user.update({
  //   where: { id: user.id },
  //   data: {
  //     savedPlans: {
  //       connect: { id: plan.id },
  //     },
  //   },
  // });

  // console.log("Updated user with saved plan:", updatedUser);

  // Query all users
  const allUsers = await prisma.user.findMany({
    include: {
      plans: true,
      savedPlans: true,
    },
  });

  console.log("All users:", allUsers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });