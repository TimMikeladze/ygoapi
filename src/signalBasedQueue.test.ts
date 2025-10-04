import { beforeEach, describe, expect, test } from 'bun:test'
import { SignalBasedQueue } from './index'

describe('SignalBasedQueue', () => {
	let queue: SignalBasedQueue

	beforeEach(() => {
		queue = new SignalBasedQueue(50) // 50ms interval for faster tests
	})

	describe('constructor', () => {
		test('should create queue with default interval', () => {
			const defaultQueue = new SignalBasedQueue()
			expect(defaultQueue).toBeInstanceOf(SignalBasedQueue)
			expect(defaultQueue.processing).toBe(false)
		})

		test('should create queue with custom interval', () => {
			const customQueue = new SignalBasedQueue(100)
			expect(customQueue).toBeInstanceOf(SignalBasedQueue)
			expect(customQueue.processing).toBe(false)
		})
	})

	describe('processing getter', () => {
		test('should return false initially', () => {
			expect(queue.processing).toBe(false)
		})

		test('should return true when processing, false when available', async () => {
			let taskStarted = false
			let taskResolver: (value: string) => void

			const task = () =>
				new Promise<string>((resolve) => {
					taskStarted = true
					taskResolver = resolve
				})

			const promise = queue.enqueue(task)

			expect(queue.processing).toBe(true)
			expect(taskStarted).toBe(true)

			// Complete the task
			taskResolver!('completed')
			await promise

			// Wait for queue to be available again
			await new Promise((resolve) => setTimeout(resolve, queue.interval + 10))
			expect(queue.processing).toBe(false)
		})
	})

	describe('enqueue', () => {
		test('should execute a simple task', async () => {
			let executed = false
			const task = async () => {
				executed = true
				return 'success'
			}

			const result = await queue.enqueue(task)

			expect(executed).toBe(true)
			expect(result).toBe('success')
		})

		test('should execute multiple tasks in sequence', async () => {
			const executionOrder: number[] = []

			const createTask = (id: number) => async () => {
				executionOrder.push(id)
				return `task-${id}`
			}

			const promises = [
				queue.enqueue(createTask(1)),
				queue.enqueue(createTask(2)),
				queue.enqueue(createTask(3)),
			]

			const results = await Promise.all(promises)

			expect(executionOrder).toEqual([1, 2, 3])
			expect(results).toEqual(['task-1', 'task-2', 'task-3'])
		})

		test('should respect the interval between tasks', async () => {
			const queue100ms = new SignalBasedQueue(100)
			const timestamps: number[] = []

			const createTask = (id: number) => async () => {
				timestamps.push(Date.now())
				return `task-${id}`
			}

			const promises = [
				queue100ms.enqueue(createTask(1)),
				queue100ms.enqueue(createTask(2)),
				queue100ms.enqueue(createTask(3)),
			]

			await Promise.all(promises)

			expect(timestamps.length).toBe(3)
			// Check that there's roughly 100ms between each task start
			expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(90)
			expect(timestamps[2] - timestamps[1]).toBeGreaterThanOrEqual(90)
		})

		test('should handle task that throws an error', async () => {
			const task = async () => {
				throw new Error('Task failed')
			}

			await expect(queue.enqueue(task)).rejects.toThrow('Task failed')
		})

		test('should handle async task that rejects', async () => {
			const task = async () => {
				await new Promise((resolve) => setTimeout(resolve, 10))
				throw new Error('Async task failed')
			}

			await expect(queue.enqueue(task)).rejects.toThrow('Async task failed')
		})

		test('should handle tasks with different return types', async () => {
			const stringTask = async () => 'string result'
			const numberTask = async () => 42
			const objectTask = async () => ({ key: 'value' })
			const booleanTask = async () => true

			const [strResult, numResult, objResult, boolResult] = await Promise.all([
				queue.enqueue(stringTask),
				queue.enqueue(numberTask),
				queue.enqueue(objectTask),
				queue.enqueue(booleanTask),
			])

			expect(strResult).toBe('string result')
			expect(numResult).toBe(42)
			expect(objResult).toEqual({ key: 'value' })
			expect(boolResult).toBe(true)
		})
	})

	describe('abort signal handling', () => {
		test('should dequeue a task if aborted while queued', async () => {
			const controller = new AbortController()
			let taskExecuted = false

			const task = async () => {
				taskExecuted = true
				return 'should not execute'
			}

			// Add a long-running task first to keep queue busy
			const longTask = () =>
				new Promise<string>((resolve) =>
					setTimeout(() => resolve('long task'), 200),
				)

			const longPromise = queue.enqueue(longTask)
			const abortPromise = queue.enqueue(task, controller.signal)

			controller.abort() // Abort while queued

			await expect(abortPromise).rejects.toThrow('Aborted while enqueued')
			expect(taskExecuted).toBe(false)

			// Long task should still complete
			await expect(longPromise).resolves.toBe('long task')
		})

		test('should handle pre-aborted signal', async () => {
			const controller = new AbortController()
			controller.abort() // Abort before enqueueing

			let taskExecuted = false
			const task = async () => {
				taskExecuted = true
				return 'should not execute'
			}

			await expect(queue.enqueue(task, controller.signal)).rejects.toThrow(
				'Aborted before enqueueing',
			)
			expect(taskExecuted).toBe(false)
		})

		test('should remove aborted task from queue', async () => {
			const controller1 = new AbortController()
			const controller2 = new AbortController()

			let task1Executed = false
			let task2Executed = false
			let task3Executed = false

			const task1 = async () => {
				task1Executed = true
				await new Promise((resolve) => setTimeout(resolve, 100))
				return 'task1'
			}

			const task2 = async () => {
				task2Executed = true
				return 'task2'
			}

			const task3 = async () => {
				task3Executed = true
				return 'task3'
			}

			const promise1 = queue.enqueue(task1)
			const promise2 = queue.enqueue(task2, controller1.signal)
			const promise3 = queue.enqueue(task3, controller2.signal)

			// Abort task2 while queued
			setTimeout(() => controller1.abort(), 25)

			const results = await Promise.allSettled([promise1, promise2, promise3])

			expect(results[0].status).toBe('fulfilled')
			expect(results[1].status).toBe('rejected')
			expect(results[2].status).toBe('fulfilled')

			expect(task1Executed).toBe(true)
			expect(task2Executed).toBe(false)
			expect(task3Executed).toBe(true)
		})

		test('should not abort task once it starts executing', async () => {
			const controller = new AbortController()
			let taskStarted = false
			let taskCompleted = false

			const task = async () => {
				taskStarted = true
				await new Promise((resolve) => setTimeout(resolve, 100))
				taskCompleted = true
				return 'completed'
			}

			const promise = queue.enqueue(task, controller.signal)

			// Wait for task to start, then abort
			await new Promise((resolve) => setTimeout(resolve, 25))
			expect(taskStarted).toBe(true)
			controller.abort()

			// Task should still complete successfully
			const result = await promise
			expect(result).toBe('completed')
			expect(taskCompleted).toBe(true)
		})

		test('should handle multiple aborts correctly', async () => {
			const controllers = [
				new AbortController(),
				new AbortController(),
				new AbortController(),
			]

			const executionOrder: number[] = []

			const createTask = (id: number) => async () => {
				executionOrder.push(id)
				await new Promise((resolve) => setTimeout(resolve, 50))
				return `task-${id}`
			}

			const promises = [
				queue.enqueue(createTask(1), controllers[0].signal),
				queue.enqueue(createTask(2), controllers[1].signal),
				queue.enqueue(createTask(3), controllers[2].signal),
			]

			// Abort task 2 while queued
			setTimeout(() => controllers[1].abort(), 25)

			const results = await Promise.allSettled(promises)

			expect(results[0].status).toBe('fulfilled')
			expect(results[1].status).toBe('rejected')
			expect(results[2].status).toBe('fulfilled')

			expect(executionOrder).toEqual([1, 3]) // Task 2 was aborted
		})
	})

	describe('doneProcessing', () => {
		test('should resolve immediately when not processing', async () => {
			const start = Date.now()
			await queue.doneProcessing()
			const elapsed = Date.now() - start

			expect(elapsed).toBeLessThan(10) // Should be immediate
		})

		test('should wait for processing to complete', async () => {
			let taskStarted = false
			let taskCompleted = false

			const dummyTask = async () => {}

			const task = async () => {
				taskStarted = true
				await new Promise((resolve) => setTimeout(resolve, 200)) // Long running task
				taskCompleted = true
				return 'done'
			}

			queue.enqueue(dummyTask) // First task to start processing immediately
			const taskPromise = queue.enqueue(task)
			const donePromise = queue.doneProcessing()

			expect(queue.processing).toBe(true)
			expect(taskStarted).toBe(false)

			await donePromise // Should resolve when queue processing is done (task started + interval passed)

			// Queue should be done processing (ready to accept new tasks)
			expect(queue.processing).toBe(false)
			expect(taskStarted).toBe(true) // Task should have started
			expect(taskCompleted).toBe(false) // But task itself is still running

			// Wait for the actual task to complete
			await taskPromise
			expect(taskCompleted).toBe(true)
		})

		test('should handle timeout correctly', async () => {
			let taskStarted = false

			const task = async () => {
				taskStarted = true
				await new Promise((resolve) => setTimeout(resolve, 200))
				return 'slow task'
			}

			const taskPromise = queue.enqueue(task)

			// The queue should still be processing because it hasn't finished starting all tasks yet
			await expect(queue.doneProcessing(10)).rejects.toThrow(
				'Queue still processing after 10ms timeout',
			)

			// After timeout, queue should still be processing (hasn't finished the interval)
			expect(queue.processing).toBe(true)

			// Wait for queue processing to actually complete
			await queue.doneProcessing()
			expect(queue.processing).toBe(false)
			expect(taskStarted).toBe(true)

			// Wait for the actual task to complete
			await taskPromise
		})

		test('should resolve before timeout if processing completes', async () => {
			let taskStarted = false

			const task = async () => {
				taskStarted = true
				await new Promise((resolve) => setTimeout(resolve, 200)) // Long running task
				return 'quick task'
			}

			const taskPromise = queue.enqueue(task)
			const start = Date.now()

			await queue.doneProcessing(200) // Generous timeout

			const elapsed = Date.now() - start
			// Should complete when queue processing is done (task started + interval), not when task completes
			expect(elapsed).toBeLessThan(150) // Should be around interval time (50ms) + some buffer
			expect(queue.processing).toBe(false)
			expect(taskStarted).toBe(true)

			// Wait for actual task completion
			await taskPromise
		})

		test('should handle multiple doneProcessing calls', async () => {
			let taskStarted = false

			const task = async () => {
				taskStarted = true
				await new Promise((resolve) => setTimeout(resolve, 200)) // Long running task
				return 'task'
			}

			const taskPromise = queue.enqueue(task)

			const donePromises = [
				queue.doneProcessing(),
				queue.doneProcessing(),
				queue.doneProcessing(),
			]

			// All should resolve when queue processing is done (not when task completes)
			await Promise.all(donePromises)

			expect(queue.processing).toBe(false)
			expect(taskStarted).toBe(true)

			// Wait for actual task completion
			await taskPromise
		})

		test('should clean up timeout on early completion', async () => {
			const task = async () => {
				await new Promise((resolve) => setTimeout(resolve, 50))
				return 'task'
			}

			const taskPromise = queue.enqueue(task)

			// This should not timeout since task completes in 50ms
			await expect(queue.doneProcessing(200)).resolves.toBeUndefined()

			await taskPromise
		})
	})

	describe('complex scenarios', () => {
		test('should handle mixed success and failure tasks', async () => {
			const results: Array<{
				id: number
				status: 'success' | 'error'
				value?: any
			}> = []

			const createTask = (id: number, shouldFail: boolean) => async () => {
				await new Promise((resolve) => setTimeout(resolve, 20))
				if (shouldFail) {
					throw new Error(`Task ${id} failed`)
				}
				return `Task ${id} success`
			}

			const promises = [
				queue.enqueue(createTask(1, false)).then(
					(value) => results.push({ id: 1, status: 'success', value }),
					(error) =>
						results.push({ id: 1, status: 'error', value: error.message }),
				),
				queue.enqueue(createTask(2, true)).then(
					(value) => results.push({ id: 2, status: 'success', value }),
					(error) =>
						results.push({ id: 2, status: 'error', value: error.message }),
				),
				queue.enqueue(createTask(3, false)).then(
					(value) => results.push({ id: 3, status: 'success', value }),
					(error) =>
						results.push({ id: 3, status: 'error', value: error.message }),
				),
			]

			await Promise.all(promises)

			expect(results).toHaveLength(3)
			expect(results[0]).toEqual({
				id: 1,
				status: 'success',
				value: 'Task 1 success',
			})
			expect(results[1]).toEqual({
				id: 2,
				status: 'error',
				value: 'Task 2 failed',
			})
			expect(results[2]).toEqual({
				id: 3,
				status: 'success',
				value: 'Task 3 success',
			})
		})

		test('should handle rapid enqueuing', async () => {
			const executionOrder: number[] = []

			const createTask = (id: number) => async () => {
				executionOrder.push(id)
				await new Promise((resolve) => setTimeout(resolve, 10))
				return id
			}

			// Rapidly enqueue many tasks
			const promises = Array.from({ length: 10 }, (_, i) =>
				queue.enqueue(createTask(i + 1)),
			)

			const results = await Promise.all(promises)

			expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
			expect(executionOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
		})

		test('should handle concurrent enqueue and abort operations', async () => {
			const controllers: AbortController[] = []
			const executionOrder: number[] = []

			const createTask = (id: number) => async () => {
				executionOrder.push(id)
				await new Promise((resolve) => setTimeout(resolve, 30))
				return id
			}

			// Create multiple tasks with abort controllers
			const promises = Array.from({ length: 5 }, (_, i) => {
				const controller = new AbortController()
				controllers.push(controller)
				return queue.enqueue(createTask(i + 1), controller.signal)
			})

			// Abort some tasks while they're queued
			setTimeout(() => {
				controllers[1].abort() // Abort task 2
				controllers[3].abort() // Abort task 4
			}, 25)

			const results = await Promise.allSettled(promises)

			// Tasks 1, 3, 5 should succeed; tasks 2, 4 should be aborted
			expect(results[0].status).toBe('fulfilled')
			expect(results[1].status).toBe('rejected')
			expect(results[2].status).toBe('fulfilled')
			expect(results[3].status).toBe('rejected')
			expect(results[4].status).toBe('fulfilled')

			expect(executionOrder).toEqual([1, 3, 5])
		})

		test('should maintain processing state correctly across multiple batches', async () => {
			const batch1Tasks = Array.from({ length: 3 }, (_, i) => async () => {
				await new Promise((resolve) => setTimeout(resolve, 30))
				return `batch1-${i + 1}`
			})

			// Enqueue first batch
			const batch1Promises = batch1Tasks.map((task) => queue.enqueue(task))

			expect(queue.processing).toBe(true)

			await Promise.all(batch1Promises)
			await queue.doneProcessing()

			expect(queue.processing).toBe(false)

			// Enqueue second batch
			const batch2Tasks = Array.from({ length: 2 }, (_, i) => async () => {
				await new Promise((resolve) => setTimeout(resolve, 30))
				return `batch2-${i + 1}`
			})

			const batch2Promises = batch2Tasks.map((task) => queue.enqueue(task))

			expect(queue.processing).toBe(true)

			await Promise.all(batch2Promises)
			await queue.doneProcessing()

			expect(queue.processing).toBe(false)
		})
	})

	describe('edge cases', () => {
		test('should handle empty queue gracefully', async () => {
			expect(queue.processing).toBe(false)
			await queue.doneProcessing()
			expect(queue.processing).toBe(false)
		})

		test('should handle task that returns undefined', async () => {
			const task = async (): Promise<undefined> => {
				await new Promise((resolve) => setTimeout(resolve, 10))
				return undefined
			}

			const result = await queue.enqueue(task)
			expect(result).toBeUndefined()
		})

		test('should handle task that returns null', async () => {
			const task = async () => {
				await new Promise((resolve) => setTimeout(resolve, 10))
				return null
			}

			const result = await queue.enqueue(task)
			expect(result).toBeNull()
		})

		test('should handle synchronous tasks', async () => {
			const task = async () => {
				return 'immediate result'
			}

			const result = await queue.enqueue(task)
			expect(result).toBe('immediate result')
		})

		test('should handle task with no return value', async () => {
			let sideEffect = false
			const task = async (): Promise<void> => {
				await new Promise((resolve) => setTimeout(resolve, 10))
				sideEffect = true
			}

			const result = await queue.enqueue(task)
			expect(result).toBeUndefined()
			expect(sideEffect).toBe(true)
		})
	})
})
