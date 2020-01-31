from multiprocessing import Pool
import sys

#from syncr import *
from asyncr import *

PARALLEL_REQUESTS = 30

PROCESS_COUNT = PARALLEL_REQUESTS // MAX_PARALLELISM
MODE = 'relay'

ITERATIONS = 10000  # number of iterations on one process
BATCH_SIZE = 100  # number of iterations the processes restarts themselves


def main():
    testmap = {'relay': relay, 'sleep': sleep, 'wait': wait, 'index': index}

    if MODE not in testmap:
        print('error!')
        sys.exit(1)

    cycle_count = ITERATIONS // BATCH_SIZE if BATCH_SIZE < ITERATIONS else 1
    iterations = (ITERATIONS if cycle_count == 1 else BATCH_SIZE) * MAX_PARALLELISM
    pool = Pool(processes=PROCESS_COUNT)
    for cycle in range(cycle_count):
        status_codes = defaultdict(int)
        result = pool.map(testmap[MODE], [(iterations)] * PROCESS_COUNT)
        for pair in result:
            # aggregate response codes
            for key in pair[0].keys():
                status_codes[key] += pair[0][key]

        # display results
        print('{:3d}. cycle of {}'.format(cycle + 1, cycle_count), end=' ')
        print(status_codes.items(), end=' ')
        print('{:.2f} TPS'.format(sum([iterations / pair[1] for pair in result])), end=' ')
        print('{:.2f} ms'.format(sum([pair[1] for pair in result]) / iterations * PROCESS_COUNT * 1000))

    pool.terminate()


if __name__ == '__main__':
    main()


