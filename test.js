class Test {
    get foo() {
        return 'foo';
    }
}

class TestTwo extends Test {
    get foo() {
        return 'bar';
    }
}

console.log(new Test().foo);
console.log(new TestTwo().foo);
