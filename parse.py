import os
import sys
import csv
import re
import glob
from collections import defaultdict

pattern = re.compile(r'_instance(?P<instance>\d+)_user(?P<user>\d+)')


def get_requests(file_name):
    with open(file_name, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        first_line = True
        for row in csv_reader:
            if first_line:
                first_line = False
                continue
            return row["# requests"]


def extract_results(root, result):
    for file_name in glob.glob(root + '/*_stats.csv'):
        print(file_name)
        requests = get_requests(file_name)
        match = pattern.search(file_name)
        instance = int(match[1])
        user = int(match[2])
        result[instance][user] = requests



def main():
    result = defaultdict(dict)
    extract_results('./test_results/50_25', result)

    print(' ',1,2,3,4,5,6,7,8,9,10,11,12,20,50,100)
    for instance, row in sorted(result.items()):
        print(instance, end=',')
        for user, requests in sorted(row.items()):
            print(requests, end=',')
        print()
    


if __name__ == '__main__':
    main()


