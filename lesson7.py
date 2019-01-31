# 1. Отсортируйте по убыванию методом "пузырька" одномерный целочисленный массив,
# заданный случайными числами на промежутке [-100; 100). Выведите на экран исходный
# и отсортированный массивы. Сортировка должна быть реализована в виде функции.
# По возможности доработайте алгоритм (сделайте его умнее).

import random
import statistics

li = []
for i in range(44):
    li.append(random.randint(-100, 100))
print(li)


def buble(list):
    n = 1
    while n < len(li):
        for i in range(len(li) - n):
            if li[i] < li[i + 1]:
                li[i], li[i + 1] = li[i + 1], li[i]
        n += 1


buble(li)
print(li)

# 2. Отсортируйте по возрастанию методом слияния одномерный вещественный массив,
# заданный случайными числами на промежутке [0; 50). Выведите на экран исходный и отсортированный массивы.


li = []

for i in range(44):
    li.append(random.randint(0, 50))
print(li)


def mergeSort(alist):
    if len(alist) > 1:
        mid = len(alist) // 2
        lefthalf = alist[:mid]
        righthalf = alist[mid:]

        mergeSort(lefthalf)
        mergeSort(righthalf)

        i = 0
        j = 0
        k = 0
        while i < len(lefthalf) and j < len(righthalf):
            if lefthalf[i] < righthalf[j]:
                alist[k] = lefthalf[i]
                i = i + 1
            else:
                alist[k] = righthalf[j]
                j = j + 1
            k = k + 1

        while i < len(lefthalf):
            alist[k] = lefthalf[i]
            i = i + 1
            k = k + 1

        while j < len(righthalf):
            alist[k] = righthalf[j]
            j = j + 1
            k = k + 1

mergeSort(li)
print(li)


# Массив размером 2m + 1, где m – натуральное число, заполнен случайным образом.
# Найдите в массиве медиану. Медианой называется элемент ряда, делящий его на две равные части:
# в одной находятся элементы, которые не меньше медианы, в другой – не больше медианы.
# Задачу можно решить без сортировки исходного массива.
# Но если это слишком сложно, то используйте метод сортировки, который не рассматривался на уроках


li = []

for i in range(44):
    li.append(random.randint(0, 50) * 2 + 1)
print(li)
static = statistics.median(li)
listmin = []
listmax = []

for i in li:
    if i < static:
        listmin.append(i)
    else:
        listmax.append(i)

print(listmin)
print(listmax)