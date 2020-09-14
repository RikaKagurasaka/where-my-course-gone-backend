import {model, Schema, Document, SchemaDefinition, Types} from "mongoose";

export const meta: SchemaDefinition = {
  id: {type: String, unique: true},
  name: String,
  englishName: String,
  timeAndLocation: [String],
  teacherName: String,
  teacherNumber: String,
  courseNumber: String,
  courseIndex: Number,
  semester: String
}

export interface ICourse {
  id: string;
  name: string;
  englishName: string;
  timeAndLocation: string[];
  teacherName: string;
  teacherNumber: string;
  courseNumber: string;
  courseIndex: number;
  semester?: string
}

export interface ICourseModel extends ICourse, Document {
  id: string;
}

export const CourseSchema = new Schema<ICourse>(meta);
export const CourseModel = model<ICourseModel>('course', CourseSchema)
