// This is a simple linked-list-based queue

class queue {
    constructor() {
        this.head = null;
        this.tail = null;
    }
    // add a value to the queue
    push(value) {
        if (this.head === null) {
            this.head = new queueNode(value);
            this.tail = this.head;
        } else {
            this.tail.next = new queueNode(value);
            this.tail = this.tail.next;
        }
    }
    // remove and return the first value in the queue
    shift() {
        if (this.head === null) {
            return null;
        }
        let value = this.head.value;
        this.head = this.head.next;
        return value;
    }
    // returns if the queue is empty
    empty() {
        if (this.head === null) {
            return true;
        }
        return false;
    }
    // get the length of the queue
    length() {
        let length = 0;
        let node = this.head;
        while (node !== null) {
            length++;
            node = node.next;
        }
        return length;
    }
}

// a node in the queue, holds a value and a pointer to the next node
class queueNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

// export the queue class
module.exports = queue;
