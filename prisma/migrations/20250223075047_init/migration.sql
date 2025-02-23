-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "bitrixId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT,
    "second_name" TEXT,
    "work_position" TEXT,
    "departmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avatar" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitrixId" TEXT NOT NULL,
    "createdDate" TEXT,
    "title" TEXT,
    "description" TEXT,
    "groupBitrixId" TEXT,
    "userBitrixId" TEXT,
    "sonetGroupId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElapsedItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bitrixId" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "userBitrixId" TEXT NOT NULL,
    "taskBitrixId" TEXT NOT NULL,
    "minutes" TEXT,

    CONSTRAINT "ElapsedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bitrixId" TEXT NOT NULL,
    "name" TEXT,
    "sort" INTEGER,
    "parent" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SonetGroup" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bitrixId" TEXT NOT NULL,
    "title" TEXT,
    "createdDate" TEXT,
    "isProject" BOOLEAN,

    CONSTRAINT "SonetGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserDepartments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserDepartments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_bitrixId_key" ON "User"("bitrixId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_bitrixId_key" ON "Task"("bitrixId");

-- CreateIndex
CREATE UNIQUE INDEX "ElapsedItem_bitrixId_key" ON "ElapsedItem"("bitrixId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_bitrixId_key" ON "Department"("bitrixId");

-- CreateIndex
CREATE UNIQUE INDEX "SonetGroup_bitrixId_key" ON "SonetGroup"("bitrixId");

-- CreateIndex
CREATE INDEX "_UserDepartments_B_index" ON "_UserDepartments"("B");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sonetGroupId_fkey" FOREIGN KEY ("sonetGroupId") REFERENCES "SonetGroup"("bitrixId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userBitrixId_fkey" FOREIGN KEY ("userBitrixId") REFERENCES "User"("bitrixId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElapsedItem" ADD CONSTRAINT "ElapsedItem_userBitrixId_fkey" FOREIGN KEY ("userBitrixId") REFERENCES "User"("bitrixId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElapsedItem" ADD CONSTRAINT "ElapsedItem_taskBitrixId_fkey" FOREIGN KEY ("taskBitrixId") REFERENCES "Task"("bitrixId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDepartments" ADD CONSTRAINT "_UserDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDepartments" ADD CONSTRAINT "_UserDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
