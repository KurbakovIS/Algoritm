# 1. В диапазоне натуральных чисел от 2 до 99 определить, сколько из них кратны любому из чисел в диапазоне от 2 до 9.


a = [0] * 8
for i in range(2, 100):
    for j in range(2, 10):
        if i % j == 0:
            a[j - 2] += 1
i = 0
while i < len(a):
    print(i + 2, ' - ', a[i])
    i += 1

# 2. Во втором массиве сохранить индексы четных элементов первого массива.
# Например, если дан массив со значениями 8, 3, 15, 6, 4, 2, то во второй массив надо заполнить значениями 1, 4, 5, 6
# (или 0, 3, 4, 5 - если индексация начинается с нуля), т.к. именно в этих позициях первого массива стоят четные числа.
from random import random

a = [8, 3, 15, 6, 4, 2]
b = []
for i in a:
    if i % 2 == 0:
        b.append(a.index(i))
print(b)

# 3. В массиве случайных целых чисел поменять местами минимальный и максимальный элементы.

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

# 4. Определить, какое число в массиве встречается чаще всего.

N = 15
arr = [0] * N
for i in range(N):
    arr[i] = int(random() * 20)
print(arr)

num = arr[0]
max_frq = 1
for i in range(N):
    frq = 1
    for k in range(i + 1, N):
        if arr[i] == arr[k]:
            frq += 1
    if frq > max_frq:
        max_frq = frq
        num = arr[i]

print(max_frq, 'раз(а) встречается число', num)


# 5. В массиве найти максимальный отрицательный элемент. Вывести на экран его значение и позицию в массиве.

a = []
for i in range(-92, 50):
    a.append(i)

print("Миним альнгое число %d" % min(a))
print("Индекс %d" % a.index(min(a)))

# 6. В одномерном массиве найти сумму элементов, находящихся между минимальным и максимальным элементами.
# Сами минимальный и максимальный элементы в сумму не включать.

N = 11
arr = []
for i in range(N):
    arr.append(int(random() * 100))

indexMin = arr.index(min(arr))
indexMax = arr.index(max(arr))
sum = 0

if indexMax > indexMin:
    indexMin +=1
    indexMax -=1
    for i in arr[indexMin + 1: indexMax - 1]:
        sum += i
else:
    indexMax +=1
    indexMin -=1
    for i in arr[indexMax: indexMin]:
        sum += i

print(sum)

# В одномерном массиве целых чисел определить два наименьших элемента.
# Они могут быть как равны между собой (оба являться минимальными), так и различаться.

N = 11
arr = []
for i in range(N):
    arr.append(int(random() * 100))

arr.sort()
print("Два мини мальных значения %d %d" % (arr[0], arr[1]))

# Матрица 5x4 заполняется вводом с клавиатуры кроме последних элементов строк.
# Программа должна вычислять сумму введенных элементов каждой строки и записывать ее в последнюю ячейку строки.
# В конце следует вывести полученную матрицу.

M = 5
N = 4
a = []
for i in range(N):
    b = []
    s = 0
    print("%d-я строка:" % i)
    for j in range(M - 1):
        n = int(input())
        s += n
        b.append(n)
    b.append(s)
    a.append(b)

for i in a:
    print(i)

# Найти максимальный элемент среди минимальных элементов столбцов матрицы.
M = 10
N = 5
a = []
for i in range(N):
    b = []
    for j in range(M):
        n = int(random()*200)
        b.append(n)
        print('%4d' % n,end='')
    a.append(b)
    print()

mx = -1
for j in range(M):
    mn = 200
    for i in range(N):
        if a[i][j] < mn:
            mn = a[i][j]
    if mn > mx:
        mx = mn
print("Максимальный среди минимальных: ", mx)