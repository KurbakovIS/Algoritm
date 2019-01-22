import cProfile
import timeit
from random import random


# Проанализировать скорость и сложность одного любого алгоритма, разработанных в рамках домашнего задания первых трех
# уроков.

def myArr():
    N = 14
    arr = []
    for i in range(N):
        arr.append(int(random() * 100))

    indexMin = arr.index(min(arr))
    indexMax = arr.index(max(arr))
    minMy = min(arr)
    maxMy = max(arr)

    arr[indexMin] = maxMy
    arr[indexMax] = minMy
    return arr

def myArr2():
    N = 14
    arr = []
    for i in range(N):
        arr.append(int(random() * 100))
    arr.sort()

    minMy = arr[0]
    maxMy = arr[-1]

    arr[0] = maxMy
    arr[-1] = minMy
    return arr

print(timeit.timeit(myArr))
print(timeit.timeit(myArr2))
# Скорость на 2 наносекунды стала лучше


# Написать два алгоритма нахождения i-го по счёту простого числа.
# Без использования «Решета Эратосфена»;
# Используя алгоритм «Решето Эратосфена»

def eratosthenes(n):
    sieve = list(range(n + 1))
    sieve[1] = 0  # без этой строки итоговый список будет содержать единицу
    for i in sieve:
        if i > 1:
            for j in range(i + i, len(sieve), i):
                sieve[j] = 0
    return sieve


def myFunc(n):
    b = []
    for i in range(2, n):
        result = True
        for j in range(2, i):
            if i % j == 0:
                result = False
        if result:
            b.append(i)
    return b


# cProfile.run("eratosthenes(10000)")
# cProfile.run("myFunc(10000)")
# Мой вариант гораздо хуже!
