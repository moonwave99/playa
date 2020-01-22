import { TypedError } from 'typed-error';

export class DatabaseError extends TypedError {}
export class FileSystemError extends TypedError {}
export class FileNotFoundError extends TypedError {}
export class AlbumNotFoundError extends TypedError {}
