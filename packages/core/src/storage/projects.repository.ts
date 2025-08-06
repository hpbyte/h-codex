import { eq } from 'drizzle-orm'

import { db } from '../storage/connection'
import { projects } from '../storage/schemas'
import { formatString } from '../utils'
import type { ProjectInsert } from '../types'

export class ProjectsRepository {
  async create(path: string) {
    const projectData: Omit<ProjectInsert, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formatString(path.split('/').pop() || 'untitled-project'),
      path,
      description: 'Project description', // TODO: summarize project description
    }

    await db.insert(projects).values(projectData).onConflictDoNothing({
      target: projects.path,
    })

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.name, projectData.name))
      .limit(1)

    if (!project) {
      throw new Error('Failed to create project')
    }

    return project
  }

  async list() {
    return db.select().from(projects).orderBy(projects.createdAt)
  }

  async get(name: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.name, formatString(name)))
      .limit(1)

    return project || null
  }

  async update(id: string, updates: Partial<Omit<ProjectInsert, 'id' | 'createdAt'>>) {
    const [project] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning()

    return project || null
  }

  async delete(id: string) {
    const result = await db.delete(projects).where(eq(projects.id, id))

    return result.length > 0
  }
}

export const projectsRepository = new ProjectsRepository()
