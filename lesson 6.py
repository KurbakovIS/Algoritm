from memory_profiler import profile
from pympler import asizeof

@profile
def eratosthenes(n):
    sieve = list(range(n + 1))
    sieve[1] = 0  # без этой строки итоговый список будет содержать единицу
    for i in sieve:
        if i > 1:
            for j in range(i + i, len(sieve), i):
                sieve[j] = 0
    return sieve

@profile
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


if __name__ == "__main__":
    myFunc(1000)
    eratosthenes(1000)
    # print(asizeof.asizeof(eratosthenes(1000))) # 7272
    # print(asizeof.asizeof(myFunc(1000))) # 3416


# При анализе функцией asizeof ,было выявленно что моя реадизация хоть и медленней но потребляет в два раза меньше
# памяти, чем Эратосфена


#   Функция         |   Размер  |
#___________________|___________|
#   eratosthenes    |   7272    |
#   myFunc          |   3416    |
#
#
#
#
#Line #    Mem usage    Increment   Line Contents
# ================================================
#     14     13.9 MiB     13.9 MiB   @profile
#     15                             def myFunc(n):
#     16     13.9 MiB      0.0 MiB       b = []
#     17     14.0 MiB      0.0 MiB       for i in range(2, n):
#     18     14.0 MiB      0.0 MiB           result = True
#     19     14.0 MiB      0.0 MiB           for j in range(2, i):
#     20     14.0 MiB      0.0 MiB               if i % j == 0:
#     21     14.0 MiB      0.0 MiB                   result = False
#     22     14.0 MiB      0.0 MiB           if result:
#     23     14.0 MiB      0.0 MiB               b.append(i)
#     24     14.0 MiB      0.0 MiB       return b
#
#
#
#Line #    Mem usage    Increment   Line Contents
# ================================================
#      4     14.0 MiB     14.0 MiB   @profile
#      5                             def eratosthenes(n):
#      6     14.0 MiB      0.0 MiB       sieve = list(range(n + 1))
#      7     14.0 MiB      0.0 MiB       sieve[1] = 0  # без этой строки итоговый список будет содержать единицу
#      8     14.0 MiB      0.0 MiB       for i in sieve:
#      9     14.0 MiB      0.0 MiB           if i > 1:
#     10     14.0 MiB      0.0 MiB               for j in range(i + i, len(sieve), i):
#     11     14.0 MiB      0.0 MiB                   sieve[j] = 0
#     12     14.0 MiB      0.0 MiB       return sieve
#
#
#Python 3
#OC 64
#