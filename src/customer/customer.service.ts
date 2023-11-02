import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>
  ) { }

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      return await this.customerRepository.save(createCustomerDto);
    } catch (error) {
      console.error("Error saving customer:", error);
      throw new InternalServerErrorException("Failed to create customer"); // Or a more specific custom exception
    }
  }

  async findAll() {
    return await this.customerRepository.find();
  }

  async findOneById(id: string) {
    try {
      const customer = await this.customerRepository.findOneBy({ id })
      if (!customer) {
        throw new NotFoundException("Customer not found")
      }
    } catch (error) {
      console.error("Error finding customer");
      throw new InternalServerErrorException("Failed to find customer");
    }
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    try {
      const customer = await this.customerRepository.findOneBy({ id })
      if (!customer) {
        throw new NotFoundException("Customer not found")
      }

      this.customerRepository.merge(customer, updateCustomerDto);
      const updatedCustomer = await this.customerRepository.save(customer);
      return updatedCustomer;

    } catch (error) {
      console.error("Error updating customer");
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException("Failed to update customer");
      }

    }
  }

  async remove(id: string) {
    try {
      const customer = await this.customerRepository.findOneBy({ id });
      if (!customer) {
        throw new NotFoundException("Customer not found");
      }

      await this.customerRepository.remove(customer);

      return HttpStatus.OK;
    } catch (error) {
      console.error("Error removing customer:", error);
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException("Failed to remove customer");
      }
    }
  }

}
