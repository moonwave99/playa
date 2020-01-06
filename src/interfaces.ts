export interface Album {
  _id: string;
  artist: string;
  title: string;
  year?: number;
  type: string;
  created: Date;
  path: string;
}
