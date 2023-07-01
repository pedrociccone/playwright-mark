import { test, expect } from '@playwright/test'
import { TaskModel } from './fixtures/task.model'
import { deleteTaskByHelper, postTask } from './support/helpers'
import { TasksPage } from './support/pages/tasks'
import data from './fixtures/tasks.json'

let tasksPage: TasksPage

test.beforeEach(({ page }) => {
    tasksPage = new TasksPage(page)
})

test.describe('Create task', () => {
    test('Should be able to register a new task', async ({ page, request }) => {
        const task = data.success as TaskModel

        await deleteTaskByHelper(request, task.name)

        await tasksPage.go()
        await tasksPage.create(task)
        await tasksPage.shouldHaveText(task.name)

        await page.waitForTimeout(1000)
    })

    test('Should not be able to allow duplicated task', async ({ page, request }) => {
        const task = data.duplicate as TaskModel

        await deleteTaskByHelper(request, task.name)
        await postTask(request, task)

        await tasksPage.go()
        await tasksPage.create(task)
        await tasksPage.alertHaveText("Task already exists!")

        await page.waitForTimeout(1000)
    })

    test('Mandatory field', async ({ page }) => {
        const task = data.required as TaskModel

        await tasksPage.go()
        await tasksPage.create(task)

        const validationMessage = await tasksPage.inputTaskName.evaluate(e => (e as HTMLInputElement).validationMessage)
        expect(validationMessage).toEqual('This is a required field')
    })
})

test.describe('Update task', () => {
    test('Should mark a task as done', async ({ page, request }) => {
        const task = data.update as TaskModel

        await deleteTaskByHelper(request, task.name)
        await postTask(request, task)

        await tasksPage.go()
        await tasksPage.toggle(task.name)
        await tasksPage.shouldBeDone(task.name)

        await page.waitForTimeout(1000)
    })
})

test.describe('Delete task', () => {
    test('Should delete a task', async ({ page, request }) => {
        const task = data.delete as TaskModel

        await deleteTaskByHelper(request, task.name)
        await postTask(request, task)

        await tasksPage.go()
        await tasksPage.remove(task.name)
        await tasksPage.shouldNotExist(task.name)

        await page.waitForTimeout(1000)
    })
})