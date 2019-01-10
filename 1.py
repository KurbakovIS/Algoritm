# Найти сумму и произведение цифр трехзначного числа, которое вводит пользователь.

a = input('Ввведите трехзначное число: ')
c = input('Введите команду: ')


def calcul(x, comand):
    if comand == 'm':
        itog = 1
        for i in x:
            itog *= int(i)
    elif comand == 's':
        itog = 0
        for i in x:
            itog += int(i)
    else:
        return 'Неизвестная команда'
    return itog


print(calcul(a, c))

# Выполнить логические побитовые операции «И», «ИЛИ» и др. над числами 5 и 6.
# Выполнить над числом 5 побитовый сдвиг вправо и влево на два знака. Объяснить полученный результат.
n1 = 5
n2 = 6

bit_or = n1 | n2
bit_and = n1 & n2
bit_xor = n1 ^ n2

print("Результат побитового OR: %s" % (bit_or))
print("Результат побитового AND: %s" % (bit_and))
print("Результат побитового XOR: %s" % (bit_xor))
print("Побитовый свдиг вправо: %s" % (
        n1 >> 2))  # битовый сдвиг  вправо на n равносилен целочисленному делению на 2n.
print("Побитовый свдиг влево: %s" % (
        n1 << 2))  # битовый сдвиг влево на n бит равносилен умножению на 2n


# По введенным пользователем координатам двух точек вывести уравнение прямой вида y=kx+b, проходящей через эти точки.
#
x1 = float(input("\tx1 = "))
y1 = float(input("\ty1 = "))

x2 = float(input("\tx2 = "))
y2 = float(input("\ty2 = "))

k = (y1 - y2) / (x1 - x2)
b = y2 - k * x2

print(" y = %.2f*x + %.2f" % (k, b))

# Написать программу, которая генерирует в указанных пользователем границах:

import random
import string

command = input('Введите команду: n для получения целого числа, f для вещественного, s для буквы: ')
stringMy = string.ascii_letters

if command == 'n':
    a = int(input("Введите первое число = "))
    b = int(input("Введите первое число = "))

    print("случайное целое число %d" % (random.randint(a, b)))
elif command == 'f':
    a = int(input("Введите первое число = "))
    b = int(input("Введите первое число = "))

    print("случайное вещественное число %d" % (random.uniform(a, b)))
elif command == 's':
    a = input("Введите первую букву = ")
    b = input("Введите вторую букву = ")

    aNum = stringMy.find(a)
    bNum = stringMy.find(b)

    print(stringMy[random.randint(aNum, bNum)])
else:
    print('Не верная команда')

# Пользователь вводит две буквы. Определить, на каких местах алфавита они стоят и сколько между ними находится букв
stringMy = string.ascii_letters
a = input("Введите первую букву = ")
b = input("Введите вторую букву = ")

aNum = stringMy.find(a)
bNum = stringMy.find(b)
rangeMy = -1

if aNum < bNum:
    for i in range(aNum, bNum):
        rangeMy += 1

else:
    for i in range(bNum, aNum):
        rangeMy += 1

print("Место первой буква %d" % aNum)
print("Место второй буква %d" % bNum)
print("Расстояние %d" % rangeMy)

# 6. Пользователь вводит номер буквы в алфавите. Определить, какая это буква.
#
stringMy = string.ascii_letters
a = input("Введите первую букву = ")
print("Место буквы в алфавите: %d" % stringMy.find(a.lower()))

# По длинам трех отрезков, введенных пользователем, определить возможность существования треугольника,
# составленного из этих отрезков.
# Если такой треугольник существует, то определить, является ли он разносторонним, равнобедренным или равносторонним.


a = int(input("a = "))
b = int(input("b = "))
c = int(input("c = "))

if a + b <= c or a + c <= b or b + c <= a:
    print("Треугольник не существует")
elif a != b and a != c and b != c:
    print("Разносторонний")
elif a == b == c:
    print("Равносторонний")
else:
    print("Равнобедренный")

# Определить, является ли год, который ввел пользователем, високосным или невисокосным.
year = int(input('Введите год: '))
if year % 4 == 0:
    print('Високосный год')
else:
    print('Невисокосный год')

# Вводятся три разных числа. Найти, какое из них является средним (больше одного, но меньше другого).
arrayMy = []
arrayMy.append(int(input("Введите первое число = ")))
arrayMy.append(int(input("Введите второе число = ")))
arrayMy.append(int(input("Введите третье число = ")))

print("реднее число %d" % (sorted(arrayMy)[1]))
