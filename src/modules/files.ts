import * as uuid from 'uuid';

import { EBucketNames, supa } from './supa';

class FileModule {
  async createFile(
    dir: EBucketNames,
    file: IFile,
    upsert?: boolean,
  ): Promise<string | undefined> {
    const extension = file.originalname.split('.').pop();
    const fileName = uuid.v4() + '.' + extension;

    const { error } = await supa.storage
      .from(dir)
      .upload(fileName, file.buffer, { upsert, contentType: file.mimetype });

    if (error) {
      throw new Error(error?.message);
    }

    return dir + '/' + fileName;
  }

  async createManyFiles(
    dir: EBucketNames,
    files: IFile[],
    upsert?: boolean,
  ): Promise<string[]> {
    const names = await Promise.all(
      files.map((f) => this.createFile(dir, f, upsert)),
    );
    return names.filter(Boolean) as string[];
  }

  async deleteFile(dir: EBucketNames, fileName: string[]) {
    const { error } = await supa.storage.from(dir).remove(fileName);

    if (error) {
      throw new Error(error?.message);
    }
  }

  getPublicUrl(dir: EBucketNames, fileName: string) {
    const { data } = supa.storage.from(dir).getPublicUrl(fileName);
    return data?.publicUrl;
  }
}

export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export const fileModule = new FileModule();
