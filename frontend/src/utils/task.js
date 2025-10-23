// frontend/src/utils/task.js

const PRIORITY = Object.freeze({
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
});

const STATUS = Object.freeze({
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    DONE: 'done',
});

export default class Task {
    constructor({
        id = null,
        name = '',
        description = '',
        priority = PRIORITY.MEDIUM,
        status = STATUS.TODO,
        due_date = null,
        createdAt = null,
        updatedAt = null
    } = {}) {
        this.id = id;
        this.name = String(name);
        this.description = String(description);
        this.priority = Object.values(PRIORITY).includes(priority) ? priority : PRIORITY.MEDIUM;
        this.status = Object.values(STATUS).includes(status) ? status : STATUS.TODO;
        this.due_date = due_date ? new Date(due_date) : null;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    }

    // expose enums
    static PRIORITY = PRIORITY;
    static STATUS = STATUS;

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            priority: this.priority,
            status: this.status,
            due_date: this.due_date ? this.due_date.toISOString().split('T')[0] : '',
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString()
        };
    }

    static fromJSON(obj = {}) {
        return new Task({
            id: obj.id ?? null,
            name: obj.name ?? '',
            description: obj.description ?? '',
            priority: obj.priority ?? PRIORITY.MEDIUM,
            status: obj.status ?? STATUS.TODO,
            due_date: obj.due_date ?? null,
            createdAt: obj.createdAt ?? null,
            updatedAt: obj.updatedAt ?? null
        });
    }

    isOverdue(reference = new Date()) {
        return this.due_date instanceof Date && this.status !== STATUS.DONE && this.due_date < reference;
    }

    isDueIn() {
        if (!this.due_date) return null;
        const now = new Date();
        const msPerDay = 24 * 60 * 60 * 1000;
        const diffDays = (this.due_date.getTime() - now.getTime()) / msPerDay;
        // For future dates round up (e.g. 0.1 -> 1), for past dates round down (e.g. -0.1 -> -1)
        return diffDays > 0 ? Math.ceil(diffDays) : Math.floor(diffDays);
    }

    _touch() {
    this.updatedAt = new Date();
}

    setStatus(newStatus) {
        if (!Object.values(STATUS).includes(newStatus)) throw new Error('Invalid status');
        this.status = newStatus;
        this._touch();
    }

    setPriority(newPriority) {
        if (!Object.values(PRIORITY).includes(newPriority)) throw new Error('Invalid priority');
        this.priority = newPriority;
        this._touch();
    }

    update(fields = {}) {
        if (fields.name !== undefined) this.name = String(fields.name);
        if (fields.description !== undefined) this.description = String(fields.description);
        if (fields.due_date !== undefined) this.due_date = fields.due_date ? new Date(fields.due_date) : null;
        if (fields.priority !== undefined) this.setPriority(fields.priority);
        if (fields.status !== undefined) this.setStatus(fields.status);
        this._touch();
    }
}