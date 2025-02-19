export interface ITask {
  id: string;
  title: string;
  groupId: string;
  description: string;
  createdDate: string;
  group: {
    id: string;
  };
}
